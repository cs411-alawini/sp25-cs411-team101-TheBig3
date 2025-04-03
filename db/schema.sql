CREATE DATABASE IF NOT EXISTS `odyssey-db-sp25`;
USE `odyssey-db-sp25`;


-- CREATE TABLE Cities(
--     CityId INT,
--     CityName VARCHAR(50) NOT NULL,
--     Longitude DECIMAL(13, 10) NOT NULL,
--     Latitude DECIMAL(13, 10) NOT NULL,
--     CityPopulation INT NOT NULL,
--     CityLanguage VARCHAR(50),
--     Country VARCHAR(50) NOT NULL,
--     Province VARCHAR(50),
--     avgTmp DECIMAL(3, 2),
--     avgMealPrice DECIMAL(3, 2),
--     avgTicketPrice DECIMAL(5, 2),

--     PRIMARY KEY (CityId),
-- );  

CREATE TABLE WorldCities(
    city VARCHAR(50) NOT NULL,
    city_ascii VARCHAR(50) NOT NULL,
    lat DECIMAL(13, 10) NOT NULL,     
    lng DECIMAL(13, 10) NOT NULL,      
    country VARCHAR(50)    
    iso2 VARCHAR(4),
    iso3 VARCHAR(4),
    admin_name VARCHAR(50) NOT NULL,
    capital VARCHAR(50) NOT NULL,
    population INT NOT NULL,
    id VARCHAR(50)

    PRIMARY KEY(id) 
);  

CREATE TABLE VacationSpots(
    VacationSpotName VARCHAR(50),
    CityId INT NOT NULL,
    LikeCount INT,
    PRIMARY KEY (VacationSpotName),
    FOREIGN KEY (CityId) REFERENCES Cities(CityId) ON DELETE CASCADE
);

CREATE TABLE UserAccounts(
    Username VARCHAR(50),
    UserPassword VARCHAR(100) NOT NULL,
    ProfilePictureUrl VARCHAR(255),
    ProfileDescription VARCHAR(255),
    Gender VARCHAR(20),
    Country VARCHAR(50),
    Age INT,

    PRIMARY KEY (Username)
);

CREATE TABLE Reviews(
    ReviewID INT,
    Username VARCHAR(50) NOT NULL,
    ReviewText VARCHAR(2000),
    ReviewRating INT,   --1 to 5 stars
    CreatedAt DATETIME,
    UpdatedAt DATETIME,
    LikeCount INT,      --for simplified purposes for each review, we will only count likes, and not who liked it 

    PRIMARY KEY (ReviewID),

    --reviews are dependent on username, if user deleted we delete the review
    FOREIGN KEY (Username) REFERENCES UserAccounts(Username) ON DELETE CASCADE,
);

CREATE TABLE Images(
    ImageURL VARCHAR(255),
    ReviewID INT NOT NULL,

    PRIMARY KEY (ImageURL),

    --images are dependent on reviews 
    FOREIGN KEY (ReviewID) REFERENCES Reviews(ReviewID) ON DELETE CASCADE,
);

CREATE TABLE Follows(
    followerUsername INT,   --person that is following
    followeeUsername INT,   --person being followed

    PRIMARY KEY (followerUsername, followeeUsername),
    

    FOREIGN KEY (followerUsername) REFERENCES UserAccounts(Username) ON DELETE CASCADE,
    FOREIGN KEY (followeeUsername) REFERENCES UserAccounts(Username) ON DELETE CASCADE
);

CREATE TABLE FavoriteSpots(
    Username VARCHAR(50),
    VacationSpotName VARCHAR(50),

    PRIMARY KEY(Username, VacationSpotName),
    FOREIGN KEY (Username) REFERENCES UserAccounts(Username) ON DELETE CASCADE,
    FOREIGN KEY (VacationSpotName) REFERENCES VacationSpots(VacationSpotName) ON DELETE CASCADE
);

CREATE TABLE VacationSpotReviews(
    ReviewId INT NOT NULL,
    VacationSpotName VARCHAR(50),

    PRIMARY KEY (ReviewId, VacationSpotName),
    FOREIGN KEY (ReviewId) REFERENCES Reviews(ReviewId) ON DELETE CASCADE,
    FOREIGN KEY (VacationSpotName) REFERENCES VacationSpots(VacationSpotName) ON DELETE CASCADE
);


