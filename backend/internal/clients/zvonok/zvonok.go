package zvonok_client

import (
	"bytes"
	"context"
	"fmt"
	"main/internal/config"
	"mime/multipart"
	"net/http"
	"time"
)

type ZvonokClient struct {
	CampaignID string
	PublicKey  string
	BaseURL    string
	httpClient *http.Client
}

func NewZvonokClient(cfg config.ZvonokConfig) *ZvonokClient {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://zvonok.com/manager/cabapi_external/api/v1/phones/tellcode/"
	}
	return &ZvonokClient{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		CampaignID: cfg.CampaignID,
		PublicKey:  cfg.PublicKey,
		BaseURL:    cfg.BaseURL,
	}
}

func (c *ZvonokClient) SendCallCode(ctx context.Context, phone string, pinCode string) error {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	_ = writer.WriteField("campaign_id", c.CampaignID)
	_ = writer.WriteField("phone", phone)
	_ = writer.WriteField("pincode", pinCode)
	_ = writer.WriteField("public_key", c.PublicKey)

	if err := writer.Close(); err != nil {
		return fmt.Errorf("failed to close multipart writer: %w", err)
	}

	url := fmt.Sprintf("%s?public_key=%s", c.BaseURL, c.PublicKey)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, body)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request to zvonok failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("zvonok returned non-2xx status code: %d", resp.StatusCode)
	}

	return nil
}
