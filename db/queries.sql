-- Our 4 advanced queries 

-- 1. User Following Feed Retrieval 
-- Get recent reviews from users the current user follows and the top 20 users with the most followers. 

SELECT ReviewID, Username, ReviewText, ReviewRating, CreatedAt, LikeCount
FROM (
    SELECT r.ReviewID, r.Username, r.ReviewText, r.ReviewRating, r.CreatedAt, r.LikeCount
    FROM Reviews r
    JOIN Follows f ON r.Username = f.followeeUsername
    WHERE f.followerUsername = 'nancy57'

    UNION

    SELECT r.ReviewID, r.Username, r.ReviewText, r.ReviewRating, r.CreatedAt, r.LikeCount
    FROM Reviews r
    JOIN (
        SELECT f.followeeUsername
        FROM Follows f
        GROUP BY f.followeeUsername
        ORDER BY COUNT(DISTINCT f.followerUsername) DESC
        LIMIT 20
    ) AS TopUsers
    ON r.Username = TopUsers.followeeUsername
) AS ReviewFeed
ORDER BY CreatedAt DESC
LIMIT 15;

-- 2. Vacation Spot Review Page 
-- When defaultly viewing vacation spot reviews, selects top 3 reviews for a given vacation spot that have a like count greater than or equal to the average like count of all reviews for that vacation spot.

SELECT 
    r.ReviewID, 
    r.Username, 
    r.ReviewText, 
    r.ReviewRating, 
    r.CreatedAt, 
    r.LikeCount, 
    vsr.VacationSpotName,
    i.ImageURL
FROM Reviews r
JOIN VacationSpotReviews vsr ON r.ReviewID = vsr.ReviewID
LEFT JOIN Images i ON r.ReviewID = i.ReviewID
WHERE vsr.VacationSpotName =  'Santana-Flowers Resort'
AND r.LikeCount >= (
    SELECT AVG(LikeCount) FROM Reviews
    WHERE ReviewID IN (
        SELECT ReviewID FROM VacationSpotReviews
        WHERE VacationSpotName =  'Santana-Flowers Resort'
    )
)
ORDER BY r.LikeCount DESC, r.CreatedAt DESC
LIMIT 3;

-- 3. Top City Vacation Spots 
-- When viewing city, find the most relevant vacation spots (including images) based on its popularity determined by number of reviews and average rating

SELECT vs.VacationSpotName, c.city_ascii, COUNT(r.ReviewID) AS TotalReviews, AVG(r.ReviewRating) AS AverageRating
FROM VacationSpots vs
    JOIN WorldCities c ON vs.CityId = c.id
    JOIN VacationSpotReviews vr ON vs.VacationSpotName = vr.VacationSpotName
    JOIN Reviews r ON vr.ReviewId = r.ReviewID
    LEFT JOIN Images i ON r.ReviewID = i.ReviewID
WHERE c.city_ascii = 'Jalalabad'
GROUP BY vs.VacationSpotName, c.city_ascii
ORDER BY TotalReviews DESC, AverageRating DESC;

-- 4. User Favorite Spot Retrieval
-- Gets users favorite vacation spots that are also popular vacation spots (have greater than the averge amount of likes of vacation spots)

SELECT fs.Username, fs.VacationSpotName, c.city, v.LikeCount
FROM FavoriteSpots fs
JOIN VacationSpots v ON fs.VacationSpotName = v.VacationSpotName
JOIN WorldCities c ON v.CityId = c.id
WHERE fs.Username = 'aaronjones'

INTERSECT

SELECT fs.Username, fs.VacationSpotName, c.city, v.LikeCount
FROM FavoriteSpots fs
JOIN VacationSpots v ON fs.VacationSpotName = v.VacationSpotName
JOIN WorldCities c ON v.CityId = c.id
WHERE v.LikeCount >= (
   SELECT AVG(LikeCount) FROM VacationSpots
)
ORDER BY LikeCount DESC
LIMIT 15;