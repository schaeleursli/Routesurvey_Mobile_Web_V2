# Backend CSRF Configuration Guide

This document provides the complete backend configuration needed to implement CSRF protection with your existing SecurityController.

## 1. Program.cs Configuration

Add the following to your `Program.cs` file:

```csharp
using Microsoft.AspNetCore.Antiforgery;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configure Session (Required for CSRF and DDoS protection)
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

// Configure Antiforgery (CSRF Protection)
builder.Services.AddAntiforgery(options =>
{
    // Configure cookie settings
    options.Cookie.Name = "CSRF-TOKEN";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.Cookie.SameSite = SameSiteMode.Strict;
    
    // Configure header name
    options.HeaderName = "X-CSRF-Token";
    
    // Configure form field name
    options.FormFieldName = "__RequestVerificationToken";
    
    // Configure token validation
    options.SuppressXFrameOptionsHeader = false;
});

// Configure CORS for CSRF
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://yourdomain.com")
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
app.UseCors("AllowSpecificOrigin");

app.UseRouting();

// Add Session middleware (MUST come before Antiforgery)
app.UseSession();

// Add Antiforgery middleware
app.UseAntiforgery();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

## 2. Security Headers Middleware

Create a custom middleware for security headers:

```csharp
// SecurityHeadersMiddleware.cs
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Security Headers
        context.Response.Headers.Add("X-Frame-Options", "DENY");
        context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
        context.Response.Headers.Add("X-Permitted-Cross-Domain-Policies", "none");
        context.Response.Headers.Add("X-Download-Options", "noopen");
        context.Response.Headers.Add("X-Mobile-App-Supported", "true");
        context.Response.Headers.Add("X-API-Version", "1.0");

        // Content Security Policy
        context.Response.Headers.Add("Content-Security-Policy", 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://use.fontawesome.com; " +
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com https://use.fontawesome.com; " +
            "img-src 'self' data: https:; " +
            "connect-src 'self' ws: wss:; " +
            "frame-ancestors 'none';");

        await _next(context);
    }
}

// Extension method
public static class SecurityHeadersMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<SecurityHeadersMiddleware>();
    }
}
```

## 3. CSRF Validation Attribute

Create a custom attribute for CSRF validation:

```csharp
// ValidateCsrfTokenAttribute.cs
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ValidateCsrfTokenAttribute : ActionFilterAttribute
{
    public override async void OnActionExecuting(ActionExecutingContext context)
    {
        var httpContext = context.HttpContext;
        var antiforgery = httpContext.RequestServices.GetRequiredService<IAntiforgery>();

        try
        {
            // Validate the request
            await antiforgery.ValidateRequestAsync(httpContext);
        }
        catch (AntiforgeryValidationException)
        {
            context.Result = new BadRequestObjectResult(new
            {
                result = false,
                message = "CSRF token validation failed. Please refresh the page and try again."
            });
            return;
        }

        base.OnActionExecuting(context);
    }
}
```

## 4. Controller Configuration

Update your controllers to use CSRF validation:

```csharp
[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    // GET requests don't need CSRF validation
    [HttpGet("GetCurrentUserData")]
    public async Task<IActionResult> GetCurrentUserData()
    {
        // Your existing logic
    }

    // POST requests need CSRF validation
    [HttpPost("LoginMain")]
    [ValidateCsrfToken] // Add this attribute
    public async Task<IActionResult> LoginMain([FromBody] LoginRequest request)
    {
        // Your existing logic
    }

    [HttpPost("UpdateProfile")]
    [ValidateCsrfToken] // Add this attribute
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        // Your existing logic
    }
}
```

## 5. Rate Limiting Configuration

Add rate limiting to your `Program.cs`:

```csharp
// Add rate limiting services
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));

    // Specific rate limiting for authentication endpoints
    options.AddPolicy("AuthenticatedUser", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? "anonymous",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// Use rate limiting middleware
app.UseRateLimiter();
```

## 6. Security Controller Enhancements

Your existing SecurityController is good, but here are some enhancements:

```csharp
[Route("api/[controller]")]
[ApiController]
public class SecurityController : ControllerBase
{
    private readonly IAntiforgery _antiforgery;
    private readonly ILogger<SecurityController> _logger;

    public SecurityController(IAntiforgery antiforgery, ILogger<SecurityController> logger)
    {
        _antiforgery = antiforgery;
        _logger = logger;
    }

    [HttpGet("csrf-token")]
    public IActionResult GetCsrfToken()
    {
        try
        {
            var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
            
            // Set the token in response header
            Response.Headers.Append("X-CSRF-Token", tokens.RequestToken);

            _logger.LogInformation("CSRF token generated for user: {UserId}", 
                User.Identity?.Name ?? "anonymous");

            return Ok(new
            {
                message = "CSRF token generated",
                token = tokens.RequestToken,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate CSRF token");
            return StatusCode(500, new
            {
                result = false,
                message = "Failed to generate CSRF token"
            });
        }
    }

    [HttpGet("headers")]
    public IActionResult GetHeaders()
    {
        var headers = new
        {
            XFrameOptions = Response.Headers.ContainsKey("X-Frame-Options"),
            XContentTypeOptions = Response.Headers.ContainsKey("X-Content-Type-Options"),
            XXSSProtection = Response.Headers.ContainsKey("X-XSS-Protection"),
            ReferrerPolicy = Response.Headers.ContainsKey("Referrer-Policy"),
            XPermittedCrossDomainPolicies = Response.Headers.ContainsKey("X-Permitted-Cross-Domain-Policies"),
            XDownloadOptions = Response.Headers.ContainsKey("X-Download-Options"),
            ContentSecurityPolicy = Response.Headers.ContainsKey("Content-Security-Policy"),
            XMobileAppSupported = Response.Headers.ContainsKey("X-Mobile-App-Supported"),
            XApiVersion = Response.Headers.ContainsKey("X-API-Version")
        };

        return Ok(new
        {
            message = "Security headers test endpoint",
            timestamp = DateTime.UtcNow,
            headers = headers
        });
    }

    [HttpGet("rate-limit-test")]
    [EnableRateLimiting("AuthenticatedUser")]
    public IActionResult RateLimitTest()
    {
        return Ok(new
        {
            message = "Rate limiting test endpoint",
            timestamp = DateTime.UtcNow,
            user = User.Identity?.Name ?? "anonymous",
            ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
        });
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
            csrfEnabled = true,
            rateLimitingEnabled = true
        });
    }
}
```

## 7. Error Handling Middleware

Create custom error handling for CSRF errors:

```csharp
// ErrorHandlingMiddleware.cs
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AntiforgeryValidationException ex)
        {
            _logger.LogWarning(ex, "CSRF validation failed for request: {Path}", context.Request.Path);
            
            context.Response.StatusCode = 403;
            context.Response.ContentType = "application/json";
            
            var response = new
            {
                result = false,
                message = "CSRF token validation failed. Please refresh the page and try again.",
                error = "CSRF_VALIDATION_FAILED"
            };
            
            await context.Response.WriteAsJsonAsync(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            
            var response = new
            {
                result = false,
                message = "An internal server error occurred.",
                error = "INTERNAL_SERVER_ERROR"
            };
            
            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
```

## 8. Testing the Implementation

### Test CSRF Token Generation:
```bash
curl -X GET "https://your-api.com/api/Security/csrf-token" \
  -H "Accept: application/json" \
  -c cookies.txt
```

### Test CSRF Protection:
```bash
# This should fail without CSRF token
curl -X POST "https://your-api.com/api/Users/LoginMain" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -b cookies.txt

# This should work with CSRF token
curl -X POST "https://your-api.com/api/Users/LoginMain" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -d '{"email":"test@example.com","password":"password"}' \
  -b cookies.txt
```

## 9. Environment Configuration

Add to your `appsettings.json`:

```json
{
  "Security": {
    "CsrfEnabled": true,
    "RateLimitingEnabled": true,
    "SecurityHeadersEnabled": true,
    "CorsOrigins": [
      "http://localhost:5173",
      "https://yourdomain.com"
    ]
  }
}
```

## 10. Deployment Considerations

1. **HTTPS Only**: Ensure your production environment uses HTTPS
2. **Cookie Settings**: Configure secure cookie settings for production
3. **CORS Configuration**: Update CORS origins for your production domain
4. **Rate Limiting**: Adjust rate limiting based on your application needs
5. **Logging**: Configure proper logging for security events
6. **Monitoring**: Set up monitoring for CSRF validation failures

## 11. Important Notes

### Session Configuration
- **Required**: Sessions must be configured for CSRF protection to work
- **Order**: `app.UseSession()` must come before `app.UseAntiforgery()`
- **CORS**: Update CORS origins to include your frontend URL (`http://localhost:5173`)

### DDoS Protection
If you're using DDoS protection middleware, ensure it's configured after session middleware:

```csharp
app.UseSession();
app.UseAntiforgery();
// Your DDoS protection middleware should come after session
app.UseMiddleware<DdosProtectionMiddleware>();
```

This configuration provides comprehensive CSRF protection that works seamlessly with your existing frontend implementation. 