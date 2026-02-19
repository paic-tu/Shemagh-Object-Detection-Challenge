import sqlite3

conn = sqlite3.connect('../frontend/prisma/dev.db')
cursor = conn.cursor()
cursor.execute("SELECT * FROM Competition LIMIT 1")
rows = cursor.fetchall()
for row in rows:
    print(row)
conn.close()
