package model

var (
	DASHBOARD_PERMISSION = map[string]interface{}{
		"id":        "9710971640510357",
		"parentId":  "",
		"label":     "sys.menu.analysis",
		"name":      "Analysis",
		"type":      1,
		"route":     "home",
		"icon":      "ic-analysis",
		"order":     1,
		"component": "/dashboard/analysis/index.tsx",
	}

	TOKEN_PERMISSION = map[string]interface{}{
		"id":       "9100714781927721",
		"parentId": "",
		"label":    "sys.menu.token",
		"name":     "Token",
		"icon":     "ph:key",
		"type":     0,
		"route":    "token",
		"order":    2,
		"children": []map[string]interface{}{
			{
				"id":        "84269992294009655",
				"parentId":  "9100714781927721",
				"label":     "sys.menu.account",
				"name":      "Account",
				"type":      1,
				"route":     "account",
				"component": "/token/account/index.tsx",
			},
			{
				"id":        "84269992294009656",
				"parentId":  "9100714781927721",
				"hide":      false,
				"label":     "sys.menu.share",
				"name":      "Share",
				"type":      1,
				"route":     "share",
				"component": "/token/share/index.tsx",
			},
		},
	}

	PERMISSION_LIST = []map[string]interface{}{
		DASHBOARD_PERMISSION,
		TOKEN_PERMISSION,
	}

	ADMIN_ROLE = map[string]interface{}{
		"id":         "4281707933534332",
		"name":       "Admin",
		"label":      "Admin",
		"status":     1,
		"order":      1,
		"desc":       "Super Admin",
		"permission": PERMISSION_LIST,
	}
)
