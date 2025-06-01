package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
			"cost": 0,
			"hidden": true,
			"id": "password901924565",
			"max": 0,
			"min": 5,
			"name": "password",
			"pattern": "",
			"presentable": false,
			"required": true,
			"system": true,
			"type": "password"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
			"cost": 0,
			"hidden": true,
			"id": "password901924565",
			"max": 0,
			"min": 8,
			"name": "password",
			"pattern": "",
			"presentable": false,
			"required": true,
			"system": true,
			"type": "password"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
