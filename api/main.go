package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	"io/ioutil"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

const (
	host     = "db"
	port     = 5432
	user     = "root"
	password = "password"
	dbname   = "harpocrates"
)

func CheckError(err error) {
	if err != nil {
		panic(err)
	}
}

func executeDB(statement string, db *sql.DB) {
	_, e := db.Exec(statement)
	CheckError(e)
}

func ReverseProxy(c *gin.Context) {
	remote, _ := url.Parse("http://ui:3000")
	proxy := httputil.NewSingleHostReverseProxy(remote)
	proxy.Director = func(req *http.Request) {
		req.Header = c.Request.Header
		req.Host = remote.Host
		req.URL = c.Request.URL
		req.URL.Scheme = remote.Scheme
		req.URL.Host = remote.Host
	}

	proxy.ServeHTTP(c.Writer, c.Request)
}

func main() {

	psqlconn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)

	db, err := sql.Open("postgres", psqlconn)
	for db.Ping() != nil {
		fmt.Println("...waiting for db to come online")
		time.Sleep(1 * time.Second)
	}
	CheckError(err)

	defer db.Close()

	// insert
	// hardcoded
	executeDB("CREATE TABLE IF NOT EXISTS secrets (hash VARCHAR UNIQUE NOT NULL, secret text, created_at TIMESTAMP NOT NULL)", db)
	fmt.Println("Finished booting db")

	r := gin.Default()
	// r.Static("/assets", "./assets")
	r.GET("/api/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.POST("/api/secret", func(c *gin.Context) {
		insertStmt := `insert into "secrets"("hash", "secret", "created_at") values($1, $2, $3)`
		bodyAsByteArray, _ := ioutil.ReadAll(c.Request.Body)
		hash := uuid.New()
		fmt.Printf("created new hash: %s", hash.String())
		_, e := db.Exec(insertStmt, hash.String(), bodyAsByteArray, time.Now())
		CheckError(e)
		c.JSON(200, gin.H{
			"hash": hash,
		})
	})
	r.GET("/api/secret/:hash", func(c *gin.Context) {
		hash := c.Param("hash")
		row := db.QueryRow(`SELECT secret FROM secrets WHERE hash = $1`, hash)
		CheckError(row.Err())
		_, err = db.Exec(`DELETE FROM secrets where hash = $1`, hash)
		CheckError(err)
		var secret string
		row.Scan(&secret)
		fmt.Printf("Got secret: %+v", secret)
		c.JSON(200, gin.H{
			"secret": secret,
		})
	})

	r.NoRoute(ReverseProxy)

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
