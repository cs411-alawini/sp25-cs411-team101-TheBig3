-- Our 4 advanced queries 

-- 1. User Following Feed Retrieval 
-- Get reviews within the last 14 days from users the current user follows and the top 10 users with the most followers. 

SELECT ReviewID, Username, ReviewText, ReviewRating, CreatedAt, LikeCount
FROM (
    SELECT r.ReviewID, r.Username, r.ReviewText, r.ReviewRating, r.CreatedAt, r.LikeCount
    FROM Reviews r
        JOIN Follows f ON r.UserName = f.followeeUsername
    WHERE f.followerUsername = 'USERNAME_I_WANT'

    UNION

    SELECT r.ReviewID, r.Username, r.ReviewText, r.ReviewRating, r.CreatedAt, r.LikeCount
    FROM Reviews r
    WHERE r.UserName IN (
        SELECT f.followeeUsername
        FROM Follows f 
        GROUP BY f.followeeUsername
        ORDER BY COUNT(DISTINCT f.followerUsername) DESC
        LIMIT 10 
    ) AS TopUsers
) AS ReviewFeed
WHERE CreatedAt >= DATE_ADD(NOW(), INTERVAL -14 DAY)
ORDER BY CreatedAt DESC; 

-- 2. Vacation Spot Review Page 
-- When defaultly viewing vacation spot reviews, finds 3 most relevant reviews for a given vacation spot (including images) based on popularity (liked or most recent) 

-- 3. Top City Vacation Spots 
-- When viewing city, find the most relevant vacation spots (including images) based on its popularity determined by number of reviews and average rating

SELECT vs.VacationSpotName, c.CityName, COUNT(r.ReviewID) AS TotalReviews, AVG(r.ReviewRating) AS AverageRating, i.ImageURL
FROM VacationSpots vs
    JOIN Cities c ON vs.CityId = c.CityId
    JOIN VacationSpotReviews vr ON vs.VacationSpotName = vr.VacationSpotName
    JOIN Reviews r ON vr.ReviewId = r.ReviewID
    LEFT JOIN Images i ON r.ReviewID = i.ReviewID
WHERE c.CityName = 'CityName'
GROUP BY vs.VacationSpotName, c.CityName, i.ImageURL
ORDER BY TotalReviews DESC, AverageRating DESC

-- 4. User Favorite Spot Retrieval?
-- Gets users favorited spots based ?

-- or 4
