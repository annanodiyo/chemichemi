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
	return &Client{
		Username: os.Getenv("AT_USERNAME"),
		APIKey:   os.Getenv("AT_APIKEY"),
	}
}

func (c *Client) SendSMS(recipient, message string) error {
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
