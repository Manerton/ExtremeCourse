package config

import (
	"fmt"
	"log"
	"os"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	Env                        string `yaml:"env"`
	DatabaseConfig             `yaml:"DB_INFO"`
	HTTPServerConfig           `yaml:"HTTP_SERVER_INFO"`
	AdditionalAddressesConfig  `yaml:"ADDITIONAL_ADDRESSES"`
	AdditionalServiceAddresses `yaml:"ADDITIONAL_SERVICE_ADDRESSES"`
	JwtConfig                  `yaml:"JWT_INFO"`
	RedisConfig                `yaml:"REDIS_INFO"`
	RabbitConfig               `yaml:"RABBIT_INFO"`
	CreationLinkConfig         `yaml:"CREATION_LINKS_TEMPLATE"`
	MigrationConfig            `yaml:"MIGRATION_INFO"`
}

type DatabaseConfig struct {
	Scheme   string `yaml:"scheme"`
	Host     string `yaml:"host"`
	Name     string `yaml:"name"`
	User     string `yaml:"user"`
	Password string `yaml:"pass"`
	SslModel string `yaml:"ssl_model"`
}

type MigrationConfig struct {
	AutoMigrate   bool   `yaml:"automigrate"`
	Driver        string `yaml:"driver"`
	MigrationPath string `yaml:"migration_path"`
}

type HTTPServerConfig struct {
	Port string `yaml:"port"`
	Host string `yaml:"host"`
}

type JwtConfig struct {
	Key             string `yaml:"key"`
	AccessDuration  int    `yaml:"access_duration"`
	RefreshDuration int    `yaml:"refresh_duration"`
}

type RedisConfig struct {
	AddressRedisPath string `yaml:"address_path"`
}

type RabbitConfig struct {
	AddressRabbitPath string `yaml:"address_path"`
	QueueName         string `yaml:"queue_name"`
}

type AdditionalServiceAddresses struct {
	NotificationService string `yaml:"notification_path"`
}

type CreationLinkConfig struct {
	Prefix string `yaml:"prefix"`
}

type AdditionalAddressesConfig struct {
	ReactVision string `yaml:"react"`
}

func (cfg *Config) GetDataSourceName() string {
	// dsn := "host=localhost user=user dbname=db password=password sslmode=disable"
	return fmt.Sprintf(
		"host=%s user=%s dbname=%s password=%s sslmode=%s",
		cfg.DatabaseConfig.Host,
		cfg.DatabaseConfig.User,
		cfg.DatabaseConfig.Name,
		cfg.DatabaseConfig.Password,
		cfg.DatabaseConfig.SslModel,
	)
}

func (cfg *Config) GetAddress() string {
	return fmt.Sprintf("%s:%s", cfg.HTTPServerConfig.Host, cfg.HTTPServerConfig.Port)
}

func MustConfigLoad() *Config {
	configPath := os.Getenv("CONFIG_PATH")
	if configPath == "" {
		configPath = "config-yaml/local.yaml"
	}

	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		log.Fatalf("config file does not exist: %s", configPath)
	}

	cfg := Config{}

	if err := cleanenv.ReadConfig(configPath, &cfg); err != nil {
		log.Fatalf("failed read config: %v", err)
	}

	return &cfg
}
