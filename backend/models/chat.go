package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Group struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name            string             `bson:"name" json:"name"`
	Members         []string           `bson:"members" json:"members"`
	ProductID       string             `bson:"product_id" json:"product_id"`
	CoverImage      string             `bson:"cover_image" json:"cover_image"`
	CreatedAt       string             `bson:"created_at" json:"created_at"`
	LastMessageAt   string             `bson:"last_message_at,omitempty" json:"last_message_at,omitempty"`
	ReadStatus      map[string]string  `bson:"read_status,omitempty" json:"read_status,omitempty"`
	Buyer           string             `bson:"buyer" json:"buyer"`
	Seller          string             `bson:"seller" json:"seller"`
	BuyerConfirmed  bool               `bson:"buyer_confirmed" json:"buyer_confirmed"`
	SellerConfirmed bool               `bson:"seller_confirmed" json:"seller_confirmed"`
}

type Message struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	GroupID     primitive.ObjectID `bson:"group_id" json:"group_id"`
	SenderEmail string             `bson:"senderEmail" json:"senderEmail"`
	Content     string             `bson:"content" json:"content"`
	Timestamp   string             `bson:"timestamp" json:"timestamp"`
}
