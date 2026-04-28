# Bug APIs - cURL Commands for Postman Testing

## 1. Bug List (buglist)

### cURL Command

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"buglist\",\"appuserid\":\"\"}",
    "p": "{\"taskId\":\"\",\"status\":\"\"}",
    "f": "Bug Management (bugmaster)"
}'
```

### For Local Testing

```bash
curl --location 'http://newnextjs.web/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"buglist\",\"appuserid\":\"\"}",
    "p": "{\"taskId\":\"\",\"status\":\"\"}",
    "f": "Bug Management (bugmaster)"
}'
```

---

## 2. Bug Save (bugsave)

### cURL Command

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"buglist\",\"appuserid\":\"\"}",
    "p": "{\"bugid\":\"\"}",
    "f": "Bug Management (bugmaster)"
}'
```

### For Local Testing

```bash
curl --location 'http://newnextjs.web/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"buglist\",\"appuserid\":\"\"}",
    "p": "{\"bugid\":\"\"}",
    "f": "Bug Management (bugmaster)"
}'
```

---

## 3. Bug Update (bugupdate)

### cURL Command

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"bugupdate\",\"appuserid\":\"\"}",
    "p": "{\"id\":\"b1\",\"title\":\"Updated title\",\"description\":\"Updated description\",\"taskId\":\"t101\",\"taskNo\":\"TSK-101\",\"taskName\":\"User Authentication\",\"assigneeId\":\"u001\",\"reporterId\":\"u002\",\"priority\":\"high\",\"severity\":\"critical\",\"dueDate\":\"2026-05-01\",\"category\":\"UI\",\"environment\":\"Production\",\"status\":\"in_progress\"}",
    "f": "Bug Management (bugmaster)"
}'
```

---

## 4. Bug Delete (bugdelete)

### cURL Command

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"bugdelete\",\"appuserid\":\"\"}",
    "p": "{\"id\":\"b1\"}",
    "f": "Bug Management (bugmaster)"
}'
```

---

## 5. Bug Detail (bugdetail)

### cURL Command

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"bugdetail\",\"appuserid\":\"\"}",
    "p": "{\"id\":\"b1\"}",
    "f": "Bug Management (bugmaster)"
}'
```

---

## 6. Comment Add (commentadd)

### cURL Command

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"commentadd\",\"appuserid\":\"\"}",
    "p": "{\"bugId\":\"b1\",\"userId\":\"u001\",\"content\":\"This is a test comment\"}",
    "f": "Bug Management (bugmaster)"
}'
```

---

## 7. Notification Get (notificationget)

### cURL Command

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"notificationget\",\"appuserid\":\"\"}",
    "p": "{\"userId\":\"u001\"}",
    "f": "Bug Management (bugmaster)"
}'
```

---

## 10. Notification Mark Read (notificationmarkread)

### cURL Command

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"notificationmarkread\",\"appuserid\":\"\"}",
    "p": "{\"id\":\"nt_123\"}",
    "f": "Bug Management (bugmaster)"
}'
```

---

## 11. Notification Create (notificationcreate)

### cURL Command

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"notificationcreate\",\"appuserid\":\"\"}",
    "p": "{\"userId\":\"u001\",\"title\":\"New Notification\",\"message\":\"Test notification message\",\"type\":\"BUG_ASSIGNED\",\"relatedId\":\"b1\"}",
    "f": "Bug Management (bugmaster)"
}'
```

---

## 12. Dashboard (dashboard)

### cURL Command

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"dashboard\",\"appuserid\":\"\"}",
    "p": "{}",
    "f": "Bug Management (bugmaster)"
}'
```

### Response Structure

The dashboard mode returns 4 result sets:
1. **Total bugs count** - Single row with `totalBugs` column
2. **Bugs by status** - Rows with `status` and `count` columns
3. **Weekly trend** - Rows with `dayIndex`, `date`, and `bugs` columns for last 7 days
4. **Recent activity** - Last 10 bug history entries

---

### cURL Command

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"notificationcreate\",\"appuserid\":\"\"}",
    "p": "{\"userId\":\"u001\",\"title\":\"New Notification\",\"message\":\"Test notification message\",\"type\":\"BUG_ASSIGNED\",\"relatedId\":\"b1\"}",
    "f": "Bug Management (bugmaster)"
}'
```

---

## Headers Explanation

```bash
curl --location 'https://apilx.optigoapps.com/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"bugsave\",\"appuserid\":\"\"}",
    "p": "{\"id\":\"b1\",\"title\":\"Login button not working\",\"description\":\"Clicking login does nothing on Chrome v120\",\"taskId\":\"t101\",\"taskNo\":\"TSK-101\",\"taskName\":\"User Authentication\",\"assigneeId\":\"u001\",\"reporterId\":\"u002\",\"priority\":\"high\",\"severity\":\"critical\",\"dueDate\":\"2026-05-01\",\"category\":\"UI\",\"environment\":\"Production\",\"status\":\"open\",\"attachments\":[{\"id\":\"a1\",\"bugId\":\"b1\",\"fileName\":\"screenshot.png\",\"fileSize\":\"204800\",\"mimeType\":\"image/png\",\"filePath\":\"/uploads/bugs/screenshot.png\"}]}",
    "f": "Bug Management (bugmaster)"
}'
```

## For Local Testing

Replace the URL with local domain:
```bash
curl --location 'http://newnextjs.web/api/report' \
--header 'YearCode: e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19' \
--header 'version: v1' \
--header 'sv: 0' \
--header 'sp: 146' \
--header 'Content-Type: application/json' \
--data '{
    "con": "{\"id\":\"\",\"mode\":\"bugsave\",\"appuserid\":\"\"}",
    "p": "{\"id\":\"b1\",\"title\":\"Login button not working\",\"description\":\"Clicking login does nothing on Chrome v120\",\"taskId\":\"t101\",\"taskNo\":\"TSK-101\",\"taskName\":\"User Authentication\",\"assigneeId\":\"u001\",\"reporterId\":\"u002\",\"priority\":\"high\",\"severity\":\"critical\",\"dueDate\":\"2026-05-01\",\"category\":\"UI\",\"environment\":\"Production\",\"status\":\"open\",\"attachments\":[{\"id\":\"a1\",\"bugId\":\"b1\",\"fileName\":\"screenshot.png\",\"fileSize\":\"204800\",\"mimeType\":\"image/png\",\"filePath\":\"/uploads/bugs/screenshot.png\"}]}",
    "f": "Bug Management (bugmaster)"
}'
```

## Headers Explanation

- **YearCode**: Encoded year/session code
- **version**: API version (v1 for bug operations)
- **sv**: Server value (default "0")
- **sp**: Service parameter (146 for bug operations)
- **Content-Type**: application/json

## Body Structure

### For Bug List (buglist)
- **con**: Connection object with mode "buglist"
- **p**: Query parameters - `{"taskId":"", "status":""}`
- **f**: Function name "Bug Management (bugmaster)"

### For Bug Save (bugsave)
- **con**: Connection object with mode "bugsave"
- **p**: Bug data as JSON string (the actual bug object)
- **f**: Function name "Bug Management (bugmaster)"

### For Bug Update (bugupdate)
- **con**: Connection object with mode "bugupdate"
- **p**: Bug data with id to update
- **f**: Function name "Bug Management (bugmaster)"

### For Bug Delete (bugdelete)
- **con**: Connection object with mode "bugdelete"
- **p**: Bug id to delete - `{"id":"b1"}`
- **f**: Function name "Bug Management (bugmaster)"

### For Bug Detail (bugdetail)
- **con**: Connection object with mode "bugdetail"
- **p**: Bug id to fetch - `{"id":"b1"}`
- **f**: Function name "Bug Management (bugmaster)"

### For Comment Add (commentadd)
- **con**: Connection object with mode "commentadd"
- **p**: Comment data - `{"bugId":"b1", "userId":"u001", "content":"comment text"}`
- **f**: Function name "Bug Management (bugmaster)"

### For Comment Get (commentget)
- **con**: Connection object with mode "commentget"
- **p**: Bug id to fetch comments - `{"bugId":"b1"}`
- **f**: Function name "Bug Management (bugmaster)"

### For Notification Get (notificationget)
- **con**: Connection object with mode "notificationget"
- **p**: User id - `{"userId":"u001"}`
- **f**: Function name "Bug Management (bugmaster)"

### For Notification Mark Read (notificationmarkread)
- **con**: Connection object with mode "notificationmarkread"
- **p**: Notification id - `{"id":"nt_123"}`
- **f**: Function name "Bug Management (bugmaster)"

### For Notification Create (notificationcreate)
- **con**: Connection object with mode "notificationcreate"
- **p**: Notification data - `{"userId":"u001", "title":"title", "message":"message", "type":"type", "relatedId":"b1"}`
- **f**: Function name "Bug Management (bugmaster)"

### For Dashboard (dashboard)
- **con**: Connection object with mode "dashboard"
- **p**: Empty object `{}`
- **f**: Function name "Bug Management (bugmaster)"
