package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"math"
	"math/rand"
	"time"

	_ "modernc.org/sqlite"
)

type Location struct {
	ID          int
	Name        string
	County      string
	Lat         float64
	Lon         float64
	Description string
	RiskOffset  int
}

type WeatherData struct {
	Temperature   float64
	Windspeed     float64
	Precipitation float64
	Timestamp     time.Time
}

type RiskLevel string

const (
	RiskSafe     RiskLevel = "SAFE"
	RiskCaution  RiskLevel = "CAUTION"
	RiskDanger   RiskLevel = "DANGER"
	RiskCritical RiskLevel = "CRITICAL"
)

type RiskFactor struct {
	Name        string
	Severity    string
	Description string
}

type RiskAssessment struct {
	Level     RiskLevel
	Score     int
	MaxScore  int
	Factors   []RiskFactor
	Advice    string
	Timestamp time.Time
}

type CommunityReport struct {
	ID         string
	LocationID int
	Lat        float64
	Lon        float64
	ReportType string
	Severity   string
	Message    string
	Reporter   string
	CreatedAt  time.Time
	DataHash   string
}

var kenyanBeaches = []Location{
	{ID: 1, Name: "Dunga Beach", County: "Kisumu", Lat: -0.1350, Lon: 34.7450, Description: "Major fish landing site, cage farming nearby", RiskOffset: 1},
	{ID: 2, Name: "Kibos", County: "Kisumu", Lat: -0.0920, Lon: 34.7800, Description: "River mouth fishing, cage culture zone", RiskOffset: 1},
	{ID: 3, Name: "Hippo Point", County: "Kisumu", Lat: -0.1450, Lon: 34.7400, Description: "Tourism + fishing overlap", RiskOffset: 0},
	{ID: 4, Name: "Ogal Beach", County: "Kisumu", Lat: -0.1200, Lon: 34.7600, Description: "Traditional fishing village", RiskOffset: 0},
	{ID: 5, Name: "Nyakach (Koru)", County: "Kisumu", Lat: -0.3500, Lon: 34.9500, Description: "River Nyando mouth, heavy agricultural runoff", RiskOffset: 1},
	{ID: 6, Name: "Homa Bay Town Beach", County: "Homa Bay", Lat: -0.5273, Lon: 34.4571, Description: "Major landing site, municipal pollution", RiskOffset: 1},
	{ID: 7, Name: "Mbita", County: "Homa Bay", Lat: -0.4167, Lon: 34.1333, Description: "Rusinga Island channel, intensive cage farming", RiskOffset: 2},
	{ID: 8, Name: "Sindo", County: "Homa Bay", Lat: -0.5000, Lon: 34.3000, Description: "Beach seine, shallow water algal bloom risk", RiskOffset: 1},
	{ID: 9, Name: "Nyandiwa", County: "Homa Bay", Lat: -0.5500, Lon: 34.2500, Description: "Fishing camp, seasonal fish kills", RiskOffset: 1},
	{ID: 10, Name: "Lambwe", County: "Homa Bay", Lat: -0.4800, Lon: 34.3800, Description: "Near river mouths, sedimentation", RiskOffset: 0},
	{ID: 11, Name: "Asembo Bay", County: "Homa Bay", Lat: -0.4300, Lon: 34.1500, Description: "Cage farming cooperative area", RiskOffset: 1},
	{ID: 12, Name: "Usenge Beach", County: "Siaya", Lat: 0.1000, Lon: 34.0500, Description: "Major landing beach, market center", RiskOffset: 0},
	{ID: 13, Name: "Uhanya Beach", County: "Siaya", Lat: 0.0800, Lon: 34.0300, Description: "Traditional fishing, water hyacinth", RiskOffset: 0},
	{ID: 14, Name: "Uyoma", County: "Siaya", Lat: 0.0500, Lon: 34.1000, Description: "Beach seine, community fishing", RiskOffset: 0},
	{ID: 15, Name: "Luanda Konyango", County: "Siaya", Lat: 0.0200, Lon: 34.0800, Description: "Near Yala Swamp outflow", RiskOffset: 1},
	{ID: 16, Name: "Asembo", County: "Siaya", Lat: 0.1500, Lon: 34.2000, Description: "Historical fishing village", RiskOffset: 0},
	{ID: 17, Name: "Port Victoria", County: "Busia", Lat: 0.1333, Lon: 33.9833, Description: "Municipal + fishing, Nzoia River mouth", RiskOffset: 1},
	{ID: 18, Name: "Bunyala", County: "Busia", Lat: 0.0500, Lon: 34.0000, Description: "Rice irrigation runoff, agrochemical input", RiskOffset: 2},
	{ID: 19, Name: "Budalangi", County: "Busia", Lat: 0.1000, Lon: 34.0500, Description: "Flood-prone, seasonal pollution", RiskOffset: 1},
	{ID: 20, Name: "Sio Port", County: "Busia", Lat: 0.1200, Lon: 34.0200, Description: "River Sio mouth, cross-border monitoring", RiskOffset: 1},
	{ID: 21, Name: "Sori Beach", County: "Migori", Lat: -0.5833, Lon: 34.1333, Description: "Major fish landing, cage farming expansion", RiskOffset: 1},
	{ID: 22, Name: "Nyatike/Macalder", County: "Migori", Lat: -0.9500, Lon: 34.3000, Description: "Gold mining runoff risk, heavy metals", RiskOffset: 2},
	{ID: 23, Name: "Kaler", County: "Migori", Lat: -0.6500, Lon: 34.1000, Description: "Beach fishing, near river mouths", RiskOffset: 0},
	{ID: 24, Name: "Karungu", County: "Migori", Lat: -0.8500, Lon: 34.2000, Description: "Traditional landing site", RiskOffset: 0},
	{ID: 25, Name: "Mfangano Island", County: "Homa Bay", Lat: 0.4500, Lon: 34.0500, Description: "Island fishing, isolated water quality", RiskOffset: -1},
	{ID: 26, Name: "Rusinga Island", County: "Homa Bay", Lat: -0.3500, Lon: 34.2000, Description: "Cage farming, erosion", RiskOffset: 1},
	{ID: 27, Name: "Takawiri Island", County: "Homa Bay", Lat: 0.3000, Lon: 34.1000, Description: "Tourism + fishing, sensitive ecosystem", RiskOffset: -1},
}

var db *sql.DB

func initDB(dbPath string) error {
	var err error
	db, err = sql.Open("sqlite", dbPath)
	if err != nil {
		return err
	}

	schema := `
	CREATE TABLE IF NOT EXISTS locations (
		id INTEGER PRIMARY KEY,
		name TEXT,
		county TEXT,
		lat REAL,
		lon REAL,
		description TEXT,
		risk_offset INTEGER
	);

	CREATE TABLE IF NOT EXISTS weather_history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		location_id INTEGER,
		temperature REAL,
		windspeed REAL,
		precipitation REAL,
		recorded_at TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS community_reports (
		id TEXT PRIMARY KEY,
		location_id INTEGER,
		lat REAL,
		lon REAL,
		report_type TEXT,
		severity TEXT,
		message TEXT,
		reporter TEXT,
		created_at TIMESTAMP,
		data_hash TEXT
	);

	CREATE TABLE IF NOT EXISTS blockchain (
		block_index INTEGER PRIMARY KEY,
		timestamp TIMESTAMP,
		report_id TEXT,
		data_hash TEXT,
		prev_hash TEXT,
		hash TEXT
	);
	`

	if _, err := db.Exec(schema); err != nil {
		return err
	}

	for _, loc := range kenyanBeaches {
		_, err := db.Exec(
			"INSERT OR IGNORE INTO locations (id, name, county, lat, lon, description, risk_offset) VALUES (?, ?, ?, ?, ?, ?, ?)",
			loc.ID, loc.Name, loc.County, loc.Lat, loc.Lon, loc.Description, loc.RiskOffset,
		)
		if err != nil {
			return err
		}
	}

	var blockCount int
	db.QueryRow("SELECT COUNT(*) FROM blockchain").Scan(&blockCount)
	if blockCount == 0 {
		genesisHash := calculateHash("chemichemi-genesis-lake-victoria-kenya-2024")
		db.Exec("INSERT INTO blockchain (block_index, timestamp, report_id, data_hash, prev_hash, hash) VALUES (0, ?, 'GENESIS', ?, '0', ?)",
			time.Now(), genesisHash, genesisHash)
	}

	var reportCount int
	db.QueryRow("SELECT COUNT(*) FROM community_reports").Scan(&reportCount)
	if reportCount == 0 {
		seedDemoReports()
	}

	return nil
}

func seedDemoReports() {
	reports := []struct {
		locID    int
		lat, lon float64
		typ      string
		sev      string
		msg      string
		reporter string
		created  time.Time
	}{
		{1, -0.1350, 34.7450, "pollution", "high", "Brown water coming from Nyando River at Dunga Beach, strong chemical smell", "James Ochieng", time.Now().AddDate(0, 0, -3)},
		{7, -0.4167, 34.1333, "fish_health", "critical", "Tilapia mortality in cages at Mbita, 200+ fish dead this morning after warm calm night", "Peter Otieno", time.Now().AddDate(0, 0, -10)},
		{12, 0.1000, 34.0500, "fish_health", "high", "Fish surfacing and gasping at dawn at Usenge, observed at 5 AM", "Daniel Omondi", time.Now().AddDate(0, 0, -7)},
		{18, 0.0500, 34.0000, "pollution", "high", "Sediment cloud from hillside farms after heavy rain, water completely brown", "Alice Juma", time.Now().AddDate(0, 0, -5)},
		{6, -0.5273, 34.4571, "pollution", "moderate", "Oil sheen on water near Homa Bay pier, possibly from boat engines", "Mary Atieno", time.Now().AddDate(0, 0, -4)},
		{10, -0.4800, 34.3800, "fish_health", "moderate", "Mudfish (kamongo) leaving water at Lambwe, sign of low oxygen", "Tom Onyango", time.Now().AddDate(0, 0, -6)},
		{21, -0.5833, 34.1333, "fish_health", "moderate", "Catfish dying in shallows at Sori, water smells rotten", "Lucy Achieng", time.Now().AddDate(0, 0, -2)},
		{2, -0.0920, 34.7800, "pollution", "high", "Foam and dead fish near Kibos river mouth, started after yesterday's rain", "Grace Akoth", time.Now().AddDate(0, 0, -8)},
		{7, -0.4167, 34.1333, "pollution", "moderate", "Water very green and thick at Mbita, fish not feeding in cages", "Peter Otieno", time.Now().AddDate(0, 0, -9)},
		{25, 0.4500, 34.0500, "fish_health", "low", "Normal conditions at Mfangano today, fish active and feeding well", "Paul Mboya", time.Now().AddDate(0, 0, -1)},
	}

	for _, r := range reports {
		id := fmt.Sprintf("RPT-%d", rand.Intn(900000)+100000)
		hash := calculateHash(id + r.msg + r.reporter)
		_, _ = db.Exec(
			"INSERT INTO community_reports (id, location_id, lat, lon, report_type, severity, message, reporter, created_at, data_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			id, r.locID, r.lat, r.lon, r.typ, r.sev, r.msg, r.reporter, r.created, hash,
		)
		addBlockToChain(id, hash)
	}
}

func calculateHash(data string) string {
	h := sha256.Sum256([]byte(data))
	return hex.EncodeToString(h[:])
}

func addBlockToChain(reportID, dataHash string) {
	var lastHash string
	row := db.QueryRow("SELECT hash FROM blockchain ORDER BY block_index DESC LIMIT 1")
	if err := row.Scan(&lastHash); err != nil {
		lastHash = "0"
	}
	var lastIndex int
	db.QueryRow("SELECT COALESCE(MAX(block_index), -1) FROM blockchain").Scan(&lastIndex)

	blockIndex := lastIndex + 1
	timestamp := time.Now().UTC()
	prevHash := lastHash
	hashInput := fmt.Sprintf("%d%s%s%s", blockIndex, timestamp.Format(time.RFC3339), reportID, prevHash)
	hash := calculateHash(hashInput)

	db.Exec(
		"INSERT INTO blockchain (block_index, timestamp, report_id, data_hash, prev_hash, hash) VALUES (?, ?, ?, ?, ?, ?)",
		blockIndex, timestamp, reportID, dataHash, prevHash, hash,
	)
}

func generateWeather(lat, lon float64, dayOffset int) WeatherData {
	seed := int64(math.Abs(lat*10000+lon*100)) + int64(dayOffset)*12345
	r := rand.New(rand.NewSource(seed))

	now := time.Now().AddDate(0, 0, dayOffset)
	doy := now.YearDay()

	seasonalTemp := 26.0 + 2.5*math.Sin(2*math.Pi*float64(doy)/365.0-math.Pi/3)
	temp := seasonalTemp + r.Float64()*3.0 - 1.5
	if temp < 23.0 {
		temp = 23.0
	}
	if temp > 31.5 {
		temp = 31.5
	}

	windBase := 5.0 - (temp-25.0)*0.4
	wind := windBase + r.Float64()*4.0 - 2.0
	if wind < 0.2 {
		wind = 0.2
	}
	if wind > 14.0 {
		wind = 14.0
	}

	wet1 := doy >= 60 && doy <= 150
	wet2 := doy >= 274 && doy <= 335
	precip := 0.0
	if wet1 || wet2 {
		precip = r.Float64() * 20.0
		if r.Float64() > 0.6 {
			precip += r.Float64() * 35.0
		}
	} else {
		if r.Float64() > 0.85 {
			precip = r.Float64() * 10.0
		}
	}

	return WeatherData{
		Temperature:   math.Round(temp*10) / 10,
		Windspeed:     math.Round(wind*10) / 10,
		Precipitation: math.Round(precip*10) / 10,
		Timestamp:     now,
	}
}

func assessRisk(w WeatherData, loc Location) *RiskAssessment {
	assessment := &RiskAssessment{
		MaxScore:  10,
		Timestamp: time.Now(),
		Factors:   []RiskFactor{},
	}
	score := 0

	switch {
	case w.Temperature > 30:
		score += 3
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Surface Temperature",
			Severity:    "critical",
			Description: fmt.Sprintf("%.1f°C — Severe thermal stratification. Warm upper layers block oxygen exchange to cage depths (3-10m).", w.Temperature),
		})
	case w.Temperature > 28:
		score += 2
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Surface Temperature",
			Severity:    "high",
			Description: fmt.Sprintf("%.1f°C — Strong stratification risk. Reduced vertical mixing expected.", w.Temperature),
		})
	case w.Temperature > 25:
		score += 1
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Surface Temperature",
			Severity:    "moderate",
			Description: fmt.Sprintf("%.1f°C — Mild stratification possible. Monitor fish surfacing behavior.", w.Temperature),
		})
	default:
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Surface Temperature",
			Severity:    "low",
			Description: fmt.Sprintf("%.1f°C — Favorable temperatures. Good potential for vertical oxygen mixing.", w.Temperature),
		})
	}

	switch {
	case w.Windspeed < 1.5:
		score += 3
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Wind Speed",
			Severity:    "critical",
			Description: fmt.Sprintf("%.1f m/s — Dead calm. No surface mixing; oxygen depletion highly likely at dawn in cage areas.", w.Windspeed),
		})
	case w.Windspeed < 3.0:
		score += 2
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Wind Speed",
			Severity:    "high",
			Description: fmt.Sprintf("%.1f m/s — Very low wind. Insufficient agitation for oxygen circulation to deep cages.", w.Windspeed),
		})
	case w.Windspeed < 5.0:
		score += 1
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Wind Speed",
			Severity:    "moderate",
			Description: fmt.Sprintf("%.1f m/s — Reduced mixing. Monitor dissolved oxygen at dawn.", w.Windspeed),
		})
	default:
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Wind Speed",
			Severity:    "low",
			Description: fmt.Sprintf("%.1f m/s — Good wind mixing. Active surface agitation promoting oxygen exchange.", w.Windspeed),
		})
	}

	switch {
	case w.Precipitation > 40:
		score += 3
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Precipitation / Runoff",
			Severity:    "critical",
			Description: fmt.Sprintf("%.1fmm — Severe runoff. Nzoia/Yala/Nyando river flooding likely. Algal bloom + oxygen crash risk in 3-7 days.", w.Precipitation),
		})
	case w.Precipitation > 20:
		score += 2
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Precipitation / Runoff",
			Severity:    "high",
			Description: fmt.Sprintf("%.1fmm — Significant agricultural runoff from sugarcane (Muhoroni), rice (Bunyala), tea (Kisii highlands).", w.Precipitation),
		})
	case w.Precipitation > 10:
		score += 1
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Precipitation / Runoff",
			Severity:    "moderate",
			Description: fmt.Sprintf("%.1fmm — Elevated turbidity and nutrient input from surrounding watershed.", w.Precipitation),
		})
	default:
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Precipitation / Runoff",
			Severity:    "low",
			Description: fmt.Sprintf("%.1fmm — Minimal runoff impact. Stable watershed conditions.", w.Precipitation),
		})
	}

	if loc.RiskOffset > 0 {
		score += loc.RiskOffset
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Location Risk",
			Severity:    "moderate",
			Description: fmt.Sprintf("%s has elevated baseline risk: %s.", loc.Name, loc.Description),
		})
	} else if loc.RiskOffset < 0 {
		score += loc.RiskOffset
		assessment.Factors = append(assessment.Factors, RiskFactor{
			Name:        "Location Benefit",
			Severity:    "low",
			Description: fmt.Sprintf("%s benefits from better natural circulation (deeper water / island exposure).", loc.Name),
		})
	}

	if score < 0 {
		score = 0
	}
	if score > 10 {
		score = 10
	}
	assessment.Score = score

	switch {
	case score >= 8:
		assessment.Level = RiskCritical
		assessment.Advice = "CRITICAL: Move fish to surface cages or harvest immediately. Deploy aerators if available. Do not feed. Contact BMU chairperson."
	case score >= 6:
		assessment.Level = RiskDanger
		assessment.Advice = "DANGER: High mortality risk. Reduce cage density. Monitor every 2 hours from 4-8 AM. Prepare emergency harvest."
	case score >= 3:
		assessment.Level = RiskCaution
		assessment.Advice = "CAUTION: Conditions favoring oxygen depletion. Watch for fish surfacing/gasping. Have aeration ready. Reduce feeding."
	default:
		assessment.Level = RiskSafe
		assessment.Advice = "SAFE: Conditions favorable. Maintain normal operations. Continue routine monitoring."
	}

	return assessment
}
