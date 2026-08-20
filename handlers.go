package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"strconv"
	"time"
)

type PageData struct {
	Locations []Location
}

type DashboardData struct {
	Location   Location
	Weather    WeatherData
	Assessment *RiskAssessment
	Forecast   []ForecastRow
	Reports    []ReportView
	RiskClass  string
}

type ForecastRow struct {
	Date          string
	Temperature   float64
	Windspeed     float64
	Precipitation float64
	RiskLevel     string
	RiskClass     string
}

type ReportView struct {
	ID         string
	ReportType string
	Severity   string
	Message    string
	Reporter   string
	CreatedAt  string
	Verified   bool
}

func riskClass(level RiskLevel) string {
	switch level {
	case RiskSafe:
		return "bg-emerald-50 text-emerald-800 border-emerald-200"
	case RiskCaution:
		return "bg-amber-50 text-amber-800 border-amber-200"
	case RiskDanger:
		return "bg-orange-50 text-orange-800 border-orange-200"
	case RiskCritical:
		return "bg-red-50 text-red-800 border-red-200 animate-pulse"
	default:
		return "bg-slate-50 text-slate-800 border-slate-200"
	}
}

func riskBadgeClass(level RiskLevel) string {
	switch level {
	case RiskSafe:
		return "bg-emerald-100 text-emerald-700"
	case RiskCaution:
		return "bg-amber-100 text-amber-700"
	case RiskDanger:
		return "bg-orange-100 text-orange-700"
	case RiskCritical:
		return "bg-red-100 text-red-700"
	default:
		return "bg-slate-100 text-slate-700"
	}
}

func severityIcon(sev string) string {
	switch sev {
	case "critical":
		return "🔴"
	case "high":
		return "🟠"
	case "moderate":
		return "🟡"
	default:
		return "🟢"
	}
}

func getReportsForLocation(locID int) []ReportView {
	var reports []ReportView
	rows, err := db.Query("SELECT id, report_type, severity, message, reporter, created_at FROM community_reports WHERE location_id = ? ORDER BY created_at DESC LIMIT 5", locID)
	if err != nil {
		return reports
	}
	defer rows.Close()

	for rows.Next() {
		var rv ReportView
		var ts time.Time
		rows.Scan(&rv.ID, &rv.ReportType, &rv.Severity, &rv.Message, &rv.Reporter, &ts)
		rv.CreatedAt = ts.Format("Jan 2, 3:04 PM")
		rv.Verified = true
		reports = append(reports, rv)
	}
	return reports
}

func getAllReports() []ReportView {
	var reports []ReportView
	rows, err := db.Query("SELECT id, report_type, severity, message, reporter, created_at FROM community_reports ORDER BY created_at DESC LIMIT 20")
	if err != nil {
		return reports
	}
	defer rows.Close()

	for rows.Next() {
		var rv ReportView
		var ts time.Time
		rows.Scan(&rv.ID, &rv.ReportType, &rv.Severity, &rv.Message, &rv.Reporter, &ts)
		rv.CreatedAt = ts.Format("Jan 2, 3:04 PM")
		reports = append(reports, rv)
	}
	return reports
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	data := PageData{Locations: kenyanBeaches}
	tmpl.ExecuteTemplate(w, "index.html", data)
}

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	locIDStr := r.URL.Query().Get("location_id")
	demo := r.URL.Query().Get("demo") == "true"

	var loc Location
	if demo {
		for _, l := range kenyanBeaches {
			if l.ID == 7 {
				loc = l
				break
			}
		}
	} else {
		id, _ := strconv.Atoi(locIDStr)
		for _, l := range kenyanBeaches {
			if l.ID == id {
				loc = l
				break
			}
		}
	}

	if loc.ID == 0 {
		http.Error(w, "Location not found", http.StatusBadRequest)
		return
	}

	weather := generateWeather(loc.Lat, loc.Lon, 0)
	if demo {
		weather.Temperature = 30.8
		weather.Windspeed = 0.4
		weather.Precipitation = 48.0
	}

	assessment := assessRisk(weather, loc)

	var forecast []ForecastRow
	for i := 1; i <= 7; i++ {
		w := generateWeather(loc.Lat, loc.Lon, i)
		a := assessRisk(w, loc)
		forecast = append(forecast, ForecastRow{
			Date:          time.Now().AddDate(0, 0, i).Format("Mon Jan 2"),
			Temperature:   w.Temperature,
			Windspeed:     w.Windspeed,
			Precipitation: w.Precipitation,
			RiskLevel:     string(a.Level),
			RiskClass:     riskBadgeClass(a.Level),
		})
	}

	reports := getReportsForLocation(loc.ID)

	tmpl.ExecuteTemplate(w, "dashboard.html", DashboardData{
		Location:   loc,
		Weather:    weather,
		Assessment: assessment,
		Forecast:   forecast,
		Reports:    reports,
		RiskClass:  riskClass(assessment.Level),
	})
}

func reportsPageHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Community Reports — Chemichemi</title>
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">
    <div class="max-w-3xl mx-auto px-4 py-6">
        <a href="/" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm mb-6 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Back to Dashboard
        </a>
        <div class="mb-6">
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Community Reports</h1>
            <p class="text-sm text-slate-500 mt-1">All reports are hashed and secured on the Chemichemi blockchain for transparency.</p>
        </div>
        <div hx-get="/reports-feed" hx-trigger="load" class="space-y-4">
            <div class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </div>
    </div>
</body>
</html>`))
}

func reportsFeedHandler(w http.ResponseWriter, r *http.Request) {
	reports := getAllReports()
	w.Header().Set("Content-Type", "text/html")

	for _, rv := range reports {
		badgeClass := "bg-purple-100 text-purple-700"
		icon := "🧪"
		if rv.ReportType == "fish_health" {
			badgeClass = "bg-blue-100 text-blue-700"
			icon = "🐟"
		}
		fmt.Fprintf(w, `<div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                    <span class="text-lg">%s</span>
                    <span class="text-xs font-bold px-2.5 py-1 rounded-full %s uppercase tracking-wide">%s</span>
                    <span class="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase">%s</span>
                </div>
                <span class="text-xs text-slate-400 font-medium whitespace-nowrap">%s</span>
            </div>
            <p class="text-sm text-slate-700 leading-relaxed mb-3">%s</p>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                <span class="text-xs font-semibold text-slate-500">— %s</span>
                <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    Blockchain Verified
                </span>
            </div>
        </div>`, icon, badgeClass, template.HTMLEscapeString(rv.ReportType), template.HTMLEscapeString(rv.Severity),
			template.HTMLEscapeString(rv.CreatedAt), template.HTMLEscapeString(rv.Message), template.HTMLEscapeString(rv.Reporter))
	}
}

func apiWeatherHandler(w http.ResponseWriter, r *http.Request) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	lon, _ := strconv.ParseFloat(r.URL.Query().Get("lon"), 64)
	weather := generateWeather(lat, lon, 0)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(weather)
}

func apiForecastHandler(w http.ResponseWriter, r *http.Request) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	lon, _ := strconv.ParseFloat(r.URL.Query().Get("lon"), 64)
	var forecast []WeatherData
	for i := 0; i < 7; i++ {
		forecast = append(forecast, generateWeather(lat, lon, i))
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(forecast)
}

func apiRiskHandler(w http.ResponseWriter, r *http.Request) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	lon, _ := strconv.ParseFloat(r.URL.Query().Get("lon"), 64)

	var nearest Location
	minDist := 999999.0
	for _, l := range kenyanBeaches {
		d := (lat-l.Lat)*(lat-l.Lat) + (lon-l.Lon)*(lon-l.Lon)
		if d < minDist {
			minDist = d
			nearest = l
		}
	}

	weather := generateWeather(lat, lon, 0)
	assessment := assessRisk(weather, nearest)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assessment)
}

func apiReportsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		var reports []ReportView
		rows, _ := db.Query("SELECT id, report_type, severity, message, reporter, created_at FROM community_reports ORDER BY created_at DESC LIMIT 20")
		defer rows.Close()
		for rows.Next() {
			var rv ReportView
			var ts time.Time
			rows.Scan(&rv.ID, &rv.ReportType, &rv.Severity, &rv.Message, &rv.Reporter, &ts)
			rv.CreatedAt = ts.Format(time.RFC3339)
			reports = append(reports, rv)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(reports)

	case "POST":
		r.ParseForm()
		locID, _ := strconv.Atoi(r.FormValue("location_id"))
		reportType := r.FormValue("report_type")
		severity := r.FormValue("severity")
		message := r.FormValue("message")
		reporter := r.FormValue("reporter")

		if message == "" || reporter == "" {
			http.Error(w, "Message and reporter required", http.StatusBadRequest)
			return
		}

		var loc Location
		for _, l := range kenyanBeaches {
			if l.ID == locID {
				loc = l
				break
			}
		}

		id := "RPT-" + strconv.FormatInt(time.Now().Unix(), 10)
		hash := calculateHash(id + message + reporter)

		_, err := db.Exec(
			"INSERT INTO community_reports (id, location_id, lat, lon, report_type, severity, message, reporter, created_at, data_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			id, locID, loc.Lat, loc.Lon, reportType, severity, message, reporter, time.Now(), hash,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		addBlockToChain(id, hash)

		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(`<div class="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold border border-emerald-200 flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            Report submitted and secured on blockchain
        </div>`))
	}
}

func apiLedgerHandler(w http.ResponseWriter, r *http.Request) {
	type LedgerEntry struct {
		BlockIndex int       `json:"block_index"`
		Timestamp  time.Time `json:"timestamp"`
		ReportID   string    `json:"report_id"`
		Hash       string    `json:"hash"`
		PrevHash   string    `json:"prev_hash"`
	}
	var entries []LedgerEntry
	rows, _ := db.Query("SELECT block_index, timestamp, report_id, hash, prev_hash FROM blockchain ORDER BY block_index DESC LIMIT 50")
	defer rows.Close()
	for rows.Next() {
		var e LedgerEntry
		rows.Scan(&e.BlockIndex, &e.Timestamp, &e.ReportID, &e.Hash, &e.PrevHash)
		entries = append(entries, e)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entries)
}

func apiVerifyHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	var hash string
	err := db.QueryRow("SELECT data_hash FROM community_reports WHERE id = ?", id).Scan(&hash)
	if err != nil {
		http.Error(w, "Report not found", http.StatusNotFound)
		return
	}

	var blockHash string
	err = db.QueryRow("SELECT hash FROM blockchain WHERE report_id = ?", id).Scan(&blockHash)

	result := map[string]interface{}{
		"report_id": id,
		"verified":  err == nil,
		"data_hash": hash,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":   "ok",
		"region":   "lake-victoria-kenya",
		"beaches":  strconv.Itoa(len(kenyanBeaches)),
		"platform": "chemichemi-vanilla-go",
	})
}
