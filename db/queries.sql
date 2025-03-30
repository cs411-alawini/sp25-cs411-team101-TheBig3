-- Our 4 advanced queries 

-- 1. User Following Feed Retrieval 
-- Get reviews within the last 30 days from users the current user follows and the top 10 users with the most followers. 

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

-- 3. Top 5 City Vacation Spots - can be used for heat map
-- When defaultly viewing city, finds 5 most relevant vacation spots (including images) based its popularity (ranked by number of reviews, average rating, how many recent reviews)

-- 4. User Favorite Spot Retrieval?
-- Gets users favorited spots based ?

-- or 4
