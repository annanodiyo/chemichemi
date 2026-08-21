package store

import (
	"encoding/json"
	"errors"
	"os"
	"sync"
)

type User struct {
	Name   string `json:"name"`
	Phone  string `json:"phone"`
	Active bool   `json:"active"`
}

// Default in-code users for demo/testing
var defaultUsers = []User{
	{Name: "Victor Ouma", Phone: "+254799619641", Active: true},
	{Name: "Amina Hassan", Phone: "+254722111222", Active: true},
	{Name: "David Kiprop", Phone: "+254733333444", Active: true},
	{Name: "Grace Wanjiku", Phone: "+254744555666", Active: true},
	{Name: "Brian Otieno", Phone: "+254755777888", Active: true},
}

type UserStore struct {
	filePath string
	mu       sync.RWMutex
	users    []User
}

func NewUserStore(filePath string) (*UserStore, error) {
	store := &UserStore{filePath: filePath}
	if err := store.load(); err != nil {
		return nil, err
	}
	return store, nil
}

func (s *UserStore) load() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := os.ReadFile(s.filePath)
	if err != nil {
		// If users.json does not exist, seed it with the default in-code users
		if errors.Is(err, os.ErrNotExist) {
			s.users = defaultUsers
			return s.save() // Write defaultUsers to users.json immediately
		}
		return err
	}
	return json.Unmarshal(data, &s.users)
}

func (s *UserStore) save() error {
	data, err := json.MarshalIndent(s.users, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.filePath, data, 0644)
	return os.WriteFile(s.filePath, data, 0o644)
}

func (s *UserStore) RegisterOrUpdate(phone, name string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, u := range s.users {
		if u.Phone == phone {
			s.users[i].Name = name
			s.users[i].Active = true
			return s.save()
		}
	}

	s.users = append(s.users, User{Name: name, Phone: phone, Active: true})
	return s.save()
}

func (s *UserStore) Deactivate(phone string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, u := range s.users {
		if u.Phone == phone {
			s.users[i].Active = false
			return s.save()
		}
	}
	return nil
}

func (s *UserStore) GetUser(phone string) (*User, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, u := range s.users {
		if u.Phone == phone {
			return &u, true
		}
	}
	return nil, false
}

func (s *UserStore) GetActiveUsers() []User {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var active []User
	for _, u := range s.users {
		if u.Active {
			active = append(active, u)
		}
	}
	return active
}
