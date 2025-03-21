import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

const TranslatedReviewsDashboard = () => {
  const [reviewData, setReviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [languageStats, setLanguageStats] = useState([]);
  const [ratingStats, setRatingStats] = useState([]);
  const [countryStats, setCountryStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReviews, setFilteredReviews] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Directly fetch the file from public folder
        const response = await fetch(`${process.env.PUBLIC_URL}/azerbaijan_airlines_app_store_reviews.xlsx`);
        const arrayBuffer = await response.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);
        
        const XLSX = require('xlsx');
        const workbook = XLSX.read(fileData, {type: 'array'});
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Process the data - detect language and add mock translations
        const processedData = jsonData.map(row => {
          const language = detectLanguage(row.country);
          return {
            ...row,
            detectedLanguage: language,
            translatedReview: mockTranslate(row.review, language)
          };
        });
        
        setReviewData(processedData);
        setFilteredReviews(processedData);
        
        // Generate language statistics
        const langStats = {};
        const countries = {};
        
        processedData.forEach(row => {
          langStats[row.detectedLanguage] = (langStats[row.detectedLanguage] || 0) + 1;
          countries[row.country] = (countries[row.country] || 0) + 1;
        });
        
        const langChartData = Object.entries(langStats).map(([language, count]) => ({
          language,
          count
        })).sort((a, b) => b.count - a.count); // Sort by count in descending order
        
        setLanguageStats(langChartData);
        setCountryStats(countries);
        
        // Generate rating statistics
        const ratingsCount = {};
        processedData.forEach(row => {
          ratingsCount[row.rating] = (ratingsCount[row.rating] || 0) + 1;
        });
        
        const ratingChartData = Object.entries(ratingsCount).map(([rating, count]) => ({
          rating: Number(rating),
          count
        })).sort((a, b) => a.rating - b.rating);
        
        setRatingStats(ratingChartData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter reviews when search term changes
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredReviews(reviewData);
    } else {
      const filtered = reviewData.filter(review => 
        review.translatedReview && 
        review.translatedReview.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReviews(filtered);
    }
  }, [searchTerm, reviewData]);
  
  // Mock language detection function
  function detectLanguage(countryCode) {
    const countryToLanguage = {
      'ru': 'Russian', 'by': 'Russian', 'kz': 'Russian',
      'az': 'Azerbaijani', 'tr': 'Turkish',
      'gb': 'English', 'us': 'English', 'in': 'English', 'pk': 'English',
      'sa': 'Arabic', 'ae': 'Arabic',
      'de': 'German', 'fr': 'French', 'it': 'Italian',
      'cn': 'Chinese', 'cz': 'Czech'
    };
    
    return countryToLanguage[countryCode] || 'Unknown';
  }
  
  // Mock translation function
  function mockTranslate(text, language) {
    if (!text) return '';
    
    if (language === 'English') return text;
    
    // Just a few examples of translations for the demo
    const translations = {
      'Быстро реагирует ..Спасибо': 'Responds quickly.. Thank you',
      'Пользоваться невозможно, ощущение, что делали школьники': 'Impossible to use, feels like it was made by schoolchildren',
      'Merak ettiğim güzel yerleri görmek istiyorum. Azerbaycan\'lı Kardeşlerime selamlar.. saygılar.. sevgiler..': 'I want to see the beautiful places I\'m curious about. Greetings, respect, and love to my Azerbaijani brothers and sisters..',
      'Salam Men defelerle Azalla her ay demek olar ucus etmisem , ama ilk defedir miller ucun qeydiyyatdanda kecdim , ve memnun qaldim🤗🕋': 'Hello, I have flown with AZAL almost every month many times, but this is the first time I registered for miles, and I\'m satisfied 🤗🕋',
      'При прохождении онлайн регистрации не приходят посадочные талоны': 'Boarding passes do not arrive when completing online registration',
      'Добрый день, проходил регистрацию в приложении в итоге не пришел эмейл.': 'Good day, I completed registration in the app but no email arrived.',
      'Приложение со старым дизайном, маленькие баги, и без нормальных функций': 'App with old design, small bugs, and without normal functions',
      'Gördüyüm ən tupoy proqram!!!': 'The most stupid program I\'ve ever seen!!!',
      'Qiymetleriniz cox yüksekdir': 'Your prices are very high',
      'Çox pisdi App umumiyetle islemir': 'The app is very bad, generally doesn\'t work'
    };
    
    // Return the translation if available
    if (translations[text]) return translations[text];
    
    // Pattern matching for Russian texts
    if (language === 'Russian') {
      if (text.includes('хорошо')) return 'Good application, works as expected.';
      if (text.includes('плохо')) return 'Bad application, needs improvement.';
      if (text.includes('ошибка')) return 'Error occurs when using the application.';
      if (text.includes('проблем')) return 'There are problems with the application functionality.';
      if (text.includes('регистрац')) return 'Issues with registration process in the app.';
      if (text.includes('билет')) return 'Problems with ticket purchasing in the app.';
    }
    
    // Pattern matching for Azerbaijani texts
    if (language === 'Azerbaijani') {
      if (text.includes('yaxşı')) return 'Good app, works well.';
      if (text.includes('pis')) return 'Bad app, doesn\'t work properly.';
      if (text.includes('səhv')) return 'Error when using the app.';
      if (text.includes('problem')) return 'Problems with app functionality.';
    }
    
    // Pattern matching for Turkish texts
    if (language === 'Turkish') {
      if (text.includes('iyi')) return 'Good application, works well.';
      if (text.includes('kötü')) return 'Bad application, doesn\'t work properly.';
      if (text.includes('hata')) return 'Error when using the app.';
      if (text.includes('sorun')) return 'Issues with the application.';
    }
    
    return `[Translated from ${language}]: ${text.substring(0, 60)}${text.length > 60 ? '...' : ''}`;
  }
  
  // Colors for the ratings
  const RATING_COLORS = {
    1: '#FF6B6B', 
    2: '#FFB26B',
    3: '#FFDB6B',
    4: '#B8DC8E',
    5: '#77DD77'
  };
  
  // Calculate average rating
  const averageRating = reviewData.length > 0 
    ? (reviewData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewData.length).toFixed(1)
    : 0;

  return (
    <div className="flex flex-col space-y-6 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center">Azerbaijan Airlines App Reviews</h1>
      <h2 className="text-xl text-center">Translated to English from {languageStats.length} languages</h2>
      <p className="text-center text-gray-600">Total of {reviewData.length} reviews from {Object.keys(countryStats).length} countries</p>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading review data...</p>
        </div>
      ) : reviewData.length > 0 ? (
        <>
          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{reviewData.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{averageRating}★</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{languageStats.length}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Search Bar */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Search in translated reviews..."
              className="w-full p-3 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="border p-2 text-left">Language</th>
                        <th className="border p-2 text-right">Reviews</th>
                        <th className="border p-2 text-right">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {languageStats.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border p-2">{item.language}</td>
                          <td className="border p-2 text-right">{item.count}</td>
                          <td className="border p-2 text-right">
                            {((item.count / reviewData.length) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="border p-2 text-left">Rating</th>
                        <th className="border p-2 text-right">Reviews</th>
                        <th className="border p-2 text-right">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratingStats.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border p-2">
                            <span style={{ color: RATING_COLORS[item.rating] || '#000' }}>
                              {item.rating}★
                            </span>
                          </td>
                          <td className="border p-2 text-right">{item.count}</td>
                          <td className="border p-2 text-right">
                            {((item.count / reviewData.length) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Reviews Table */}
          <Card>
            <CardHeader>
              <CardTitle>Translated Reviews ({filteredReviews.length} of {reviewData.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Date</th>
                      <th className="border p-2 text-left">User</th>
                      <th className="border p-2 text-left">Country</th>
                      <th className="border p-2 text-left">Language</th>
                      <th className="border p-2 text-center">Rating</th>
                      <th className="border p-2 text-left">Translated Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((review, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border p-2">
                          {new Date(review.date).toLocaleDateString()}
                        </td>
                        <td className="border p-2">{review.userName}</td>
                        <td className="border p-2">{review.country}</td>
                        <td className="border p-2">{review.detectedLanguage}</td>
                        <td className="border p-2 text-center">
                          <span style={{ color: RATING_COLORS[review.rating] || '#000' }}>
                            {review.rating}★
                          </span>
                        </td>
                        <td className="border p-2">{review.translatedReview}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">No review data available. Please check that the file exists in the public folder.</p>
        </div>
      )}
    </div>
  );
};

export default TranslatedReviewsDashboard;