# MASL API CORS Configuration Guide

## Problem
The MASL API at `https://reporting-api.route-survey.survys.com` is responding with `Access-Control-Allow-Origin: *` which is not allowed when the frontend makes requests with `withCredentials: true`.

## Solution: Configure CORS for Credentialed Requests

### 1. Update CORS Configuration

Replace the current CORS configuration in your MASL API backend with:

```csharp
// Program.cs or Startup.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowRouteSurveyOrigin", policy =>
    {
        policy.WithOrigins("https://route-survey.survys.com")
              .AllowCredentials()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// In the middleware pipeline
app.UseCors("AllowRouteSurveyOrigin");
```

### 2. Alternative: Environment-Based Configuration

For different environments, use:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowRouteSurveyOrigin", policy =>
    {
        var allowedOrigins = new List<string>();
        
        if (app.Environment.IsDevelopment())
        {
            allowedOrigins.Add("http://localhost:5173");
            allowedOrigins.Add("http://localhost:3000");
        }
        else
        {
            allowedOrigins.Add("https://route-survey.survys.com");
        }
        
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowCredentials()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

### 3. Complete Program.cs Example

```csharp
using Microsoft.AspNetCore.Cors;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowRouteSurveyOrigin", policy =>
    {
        policy.WithOrigins("https://route-survey.survys.com")
              .AllowCredentials()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// Use CORS before routing
app.UseCors("AllowRouteSurveyOrigin");

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

## Solution 2: Frontend Workaround (Temporary)

If you cannot immediately update the MASL API backend, you can temporarily modify the frontend to not send credentials for this specific API:

### Update the Reporting Controller

```javascript
// src/controllers/reporting/reporting_controller.js
import axios from "axios";
import Cookies from "js-cookie";

class ReportingController {
  async generateReportFromTemplate(template, routeId) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      // Create a separate axios instance for MASL API without credentials
      const maslAxios = axios.create({
        baseURL: import.meta.env.VITE_MASL_API_BASE_URL,
        withCredentials: false // Disable credentials for MASL API
      });

      const res = await maslAxios.post(
        "/api/generate_masl_doc_from_template_non_blocking",
        {
          htmlContent: template,
          routeId: routeId,
          userId: uid,
        }
      );

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }
}

export default new ReportingController();
```

## Solution 3: Proxy Configuration (Alternative)

If you have control over the web server configuration, you can set up a proxy to avoid CORS issues:

### Nginx Configuration Example

```nginx
server {
    listen 443 ssl;
    server_name route-survey.survys.com;
    
    # Proxy MASL API requests
    location /api/masl/ {
        proxy_pass https://reporting-api.route-survey.survys.com/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Your regular frontend configuration
    location / {
        # Your frontend serving configuration
    }
}
```

Then update the frontend to use the proxied endpoint:

```javascript
// Update VITE_MASL_API_BASE_URL in .env.production
VITE_MASL_API_BASE_URL="https://route-survey.survys.com/api/masl"
```

## Recommended Approach

1. **Immediate Fix**: Use Solution 2 (Frontend Workaround) to get the app working
2. **Long-term Fix**: Implement Solution 1 (Backend CORS Configuration) for proper security
3. **Alternative**: Consider Solution 3 (Proxy) if you have server control

## Security Considerations

- **Credentials**: Only disable credentials if the MASL API doesn't require authentication
- **CORS Policy**: Always specify exact origins instead of using wildcards
- **HTTPS**: Ensure all production endpoints use HTTPS
- **Headers**: Only allow necessary headers in CORS configuration

## Testing

After implementing any solution, test with:

```bash
# Test the MASL API endpoint
curl -X POST "https://reporting-api.route-survey.survys.com/api/generate_masl_doc_from_template_non_blocking" \
  -H "Content-Type: application/json" \
  -H "Origin: https://route-survey.survys.com" \
  -d '{"htmlContent":"test","routeId":1,"userId":1}'
```

The response should include proper CORS headers:
```
Access-Control-Allow-Origin: https://route-survey.survys.com
Access-Control-Allow-Credentials: true
``` 