package notification_client

import (
	"crypto/tls"
	"fmt"
	"net/http"
)

type NotificationClient interface {
	SendNotifyAcceptAccount(email string) error
}

type HTTPNotificationClient struct {
	url          string
	client       *http.Client
	requestToken string
}

func New(url string) *HTTPNotificationClient {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}

	return &HTTPNotificationClient{
		url:    url,
		client: client,
	}
}

func (c *HTTPNotificationClient) SendNotifyAcceptAccount(email string) error {
	req, err := http.NewRequest(http.MethodPost, c.url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	// Header set
	req.Header.Set("requestToken", c.requestToken)
	req.Header.Set("email", email)

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to get response: %w", err)
	}
	defer resp.Body.Close()
	return nil
}
