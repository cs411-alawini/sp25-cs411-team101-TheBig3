--DDL commands to initialize our relational schema

CREATE TABLE Cities(
    CityId INT,
    CityName VARCHAR(50) NOT NULL,
    Longitude DECIMAL(13, 10) NOT NULL,
    Latitude DECIMAL(13, 10) NOT NULL,
    CityPopulation INT NOT NULL,
    CityLanguage VARCHAR(50),
    Country VARCHAR(50) NOT NULL,
    Province VARCHAR(50),
    avgTmp DECIMAL(3, 2),
    avgMealPrice DECIMAL(3, 2),
    avgTicketPrice DECIMAL(5, 2),
    PRIMARY KEY (CityId),

    );

CREATE TABLE VacationSpots(
    --we are assuming that no two vacation spot names are the same
    VacationSpotName VARCHAR(50),
    CityId INT NOT NULL,

    PRIMARY KEY (VacationSpotName),

    FOREIGN KEY (CityId) REFERENCES Cities(CityId) ON DELETE SET NULL,
);

CREATE TABLE UserAccounts(
    Username VARCHAR(50),
    UserPassword VARCHAR(100) NOT NULL,
    ProfilePictureUrl VARCHAR(255),
    ProfileDescription VARCHAR(255),
    Gender VARCHAR(20),
    Country VARCHAR(50),
    Age INT,

    PRIMARY KEY (Username),
);


CREATE TABLE Reviews(
    ReviewID INT,
    Username VARCHAR(50) NOT NULL,
    ReviewText VARCHAR(2000),
    CreationTime DATETIME,

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
    --person that is following
    followerUsername INT,

    --person being followed
    followeeUsername INT,

    PRIMARY KEY (followerUsername, followeeUsername),
    
    --if either user is deleted, we get rid of this follow
    FOREIGN KEY (followerUsername) REFERENCES UserAccounts(Username) ON DELETE CASCADE,
    FOREIGN KEY (followeeUsername) REFERENCES UserAccounts(Username) ON DELETE CASCADE,
);

CREATE TABLE FavoriteSpots(
    Username VARCHAR(50),
    VacationSpotName VARCHAR(50),

    PRIMARY KEY(Username, VacationSpotName),
    FOREIGN KEY (Username) REFERENCES UserAccounts(Username) ON DELETE CASCADE,
    FOREIGN KEY (VacationSpotName) REFERENCES VacationSpots(VacationSpotName) ON DELETE CASCADE,
);

CREATE TABLE VacationSpotReviews(
    ReviewId INT NOT NULL,
    VacationSpotName VARCHAR(50),

    PRIMARY KEY (ReviewId, VacationSpotName),
    FOREIGN KEY (ReviewId) REFERENCES Reviews(reviewId) ON DELETE CASCADE,
    FOREIGN KEY (VacationSpotName) REFERENCES VacationSpots(VacationSpotName) ON DELETE CASCADE,
);


