package hooks

import (
	"github.com/pocketbase/pocketbase"
)

// ConfigureHooks sets up all PocketBase event hooks
func ConfigureHooks(app *pocketbase.PocketBase) {
	// Hook into user creation to set default role
	app.OnRecordCreate("users").BindFunc(setNewUserRole)
}
