package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type OTP struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email     string             `bson:"email" json:"email"`
	Code      string             `bson:"code" json:"code"`
	ExpiresAt string             `bson:"expires_at" json:"expires_at"`
}
