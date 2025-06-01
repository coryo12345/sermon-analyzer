package hooks

import (
	"api/internal/models"

	"github.com/pocketbase/pocketbase/core"
)

func setNewUserRole(e *core.RecordEvent) error {
	// Set the role to viewer for new users
	e.Record.Set("role", models.UserRoleViewer)

	return e.Next()
}
