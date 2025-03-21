from app_store_scraper import AppStore
import pandas as pd

# List of relevant country codes (Apple 2-letter ISO country codes)
countries = [
    # Europe
    'at', 'by', 'bg', 'cz', 'fr', 'de', 'gr', 'it', 'md', 'me', 'ro', 'ch', 'gb',
    # Asia
    'af', 'bh', 'cn', 'in', 'ir', 'iq', 'il', 'kz', 'kw', 'kg', 'mv', 'pk', 'qa', 'sa', 'tj', 'tr', 'tm', 'uz', 'ae',
    # CIS (some overlap)
    'ru',
    # Azerbaijan (home country)
    'az'
]

# Initialize list to store all reviews
all_reviews = []

# Loop through each country and fetch reviews
for country in countries:
    print(f"Scraping country: {country}")
    app = AppStore(country=country, app_name='azal-book-flight-ticket', app_id='1451475994')
    app.review(how_many=100)
    for r in app.reviews:
        r['country'] = country
    all_reviews.extend(app.reviews)

# Convert to DataFrame
df = pd.DataFrame(all_reviews)

# Clean and sort
df = df[['date', 'userName', 'review', 'rating', 'country']]
df = df.sort_values('date', ascending=False)

# Save output
df.to_csv('azerbaijan_airlines_app_store_reviews.csv', index=False)
df.to_excel('azerbaijan_airlines_app_store_reviews.xlsx', index=False)

print(f"Total reviews scraped: {len(df)}")
