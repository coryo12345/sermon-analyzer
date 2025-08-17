package main

import (
	"log"
	"os"

	"api/internal/hooks"
	"api/internal/jobs"
	_ "api/migrations"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file", err.Error())
	}

	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: os.Getenv("APP_ENV") == "development" || os.Getenv("APP_ENV") == "dev",
	})

	// serves static files from the provided public dir (if exists)
	// this is how the ui gets served in production
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))
		return se.Next()
	})

	// set settings values in code
	app.OnSettingsReload().BindFunc(func(e *core.SettingsReloadEvent) error {
		if err := e.Next(); err != nil {
			return err
		}
		e.App.Settings().Meta.AppName = "Sermon Analysis"
		e.App.Settings().Meta.AppURL = os.Getenv("APP_URL")
		e.App.Settings().Meta.SenderAddress = "noreply@sermon.corydio.com"
		e.App.Settings().Meta.SenderName = "Sermon Analysis"
		e.App.Settings().Meta.HideControls = os.Getenv("APP_ENV") == "production" || os.Getenv("APP_ENV") == "prod"
		return nil
	})

	hooks.ConfigureHooks(app)

	app.Cron().MustAdd("analyze-sermons", "* * * * *", func() {
		jobs.SermonAnalysisJob(app)
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
