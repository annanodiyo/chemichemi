package sms

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
)

// Client handles Africa's Talking API interactions
type Client struct {
	Username string
	APIKey   string
}

func NewClient() *Client {
	apiKey := os.Getenv("AT_APIKEY")
	username := os.Getenv("AT_USERNAME")

	if apiKey == "" {
		apiKey = os.Getenv("AFRICASTALKING_SANDBOX_API_KEY")
	}
	if username == "" && apiKey != "" {
		username = "sandbox"
	}

	return &Client{
		Username: username,
		APIKey:   apiKey,
	}
}

func (c *Client) SendSMS(recipient, message string) error {
	if c.Username == "" || c.APIKey == "" {
		return fmt.Errorf("Africa's Talking is not configured: set AT_USERNAME and AT_APIKEY, or AFRICASTALKING_SANDBOX_API_KEY")
	}
	if strings.TrimSpace(recipient) == "" || strings.TrimSpace(message) == "" {
		return fmt.Errorf("recipient and message are required")
	}

	apiURL := "https://api.africastalking.com/version1/messaging"
	if c.Username == "sandbox" {
		apiURL = "https://api.sandbox.africastalking.com/version1/messaging"
	}

	form := url.Values{}
	form.Set("username", c.Username)
	form.Set("to", recipient)
	form.Set("message", message)

	req, err := http.NewRequest("POST", apiURL, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("apiKey", c.APIKey)

	httpClient := &http.Client{}
	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}
