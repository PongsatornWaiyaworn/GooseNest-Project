package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" form:"id"`
	FirstName string             `bson:"firstName" form:"firstName"`
	LastName  string             `bson:"lastName" form:"lastName"`
	NameStore string             `bson:"namestore" form:"namestore"`
	Email     string             `bson:"email" form:"email"`
	Username  string             `bson:"username" form:"username"`
	Password  string             `bson:"password,omitempty" form:"password"`
	Phone     string             `bson:"phone" form:"phone"`
	Address   string             `bson:"address" form:"address"`
	Facebook  string             `bson:"facebook" form:"facebook"`
	Instagram string             `bson:"instagram" form:"instagram"`
	Line      string             `bson:"line" form:"line"`
	Discord   string             `bson:"discord" form:"discord"`
	Bio       string             `bson:"bio" form:"bio"`
	Games     []string           `bson:"games" form:"games"`
	Image     string             `bson:"image" form:"image"`
}
