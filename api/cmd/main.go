package main

import (
	"log"
	"os"

	"api/internal/hooks"
	_ "api/migrations"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	// serves static files from the provided public dir (if exists)
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
		// TODO - get app url from env
		// e.App.Settings().Meta.AppURL = "http://localhost:8090"
		return nil
	})

	hooks.ConfigureHooks(app)

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
