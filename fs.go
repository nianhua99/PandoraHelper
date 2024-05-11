package PandoraHelper

import "embed"

//go:embed frontend/dist
var EmbedFrontendFS embed.FS

//go:embed web
var EmbedWebFS embed.FS
