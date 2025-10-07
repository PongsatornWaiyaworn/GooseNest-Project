package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ReportIssue struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email       string             `bson:"email" json:"email"`
	IssueType   string             `bson:"issueType" json:"issueType"`
	Subject     string             `bson:"subject" json:"subject"`
	Description string             `bson:"description" json:"description"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
}

type ReportIssuePost struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email         string             `bson:"email" json:"email"`
	IssueType     string             `bson:"issueType" json:"issueType"`
	Subject       string             `bson:"subject" json:"subject"`
	Description   string             `bson:"description" json:"description"`
	ListingID     *string            `bson:"listingId,omitempty" json:"listingId"`
	ReportedEmail *string            `bson:"reportedEmail,omitempty" json:"reportedEmail"`
	CreatedAt     time.Time          `bson:"createdAt" json:"createdAt"`
}
