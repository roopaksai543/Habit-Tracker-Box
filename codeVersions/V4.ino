
#include <LiquidCrystal.h>
#include <TimeLib.h>

// Set Goal Days (1 - Sunday... 7 - Saturday)
int goalDay1 = 4; // Wednesday
int goalDay2 = 7; // Saturday

// LCD Set Up 
LiquidCrystal lcd (8, 9, 10, 11, 12, 13);

// Time-tracking Set Up
const char* daysOfTheWeek[] = {
  "Error", "Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"
};
String originalLine = "";

// Button Set Up
const int buttonPin = 2;
int buttonState = 0;
bool hasBeenPressed = false;

// Other variables
int totalDaysPassed;
int changingGoalDay;
int savedHour;
int savedMinute;

void setup() {
  
  // Used for debugging
  Serial.begin(9600);

  // Makes sure the larger one is goalDay2 and smaller is goalDay1
  arrangeGoalDays();

  // More LCD Set Up
  lcd.begin(16, 2);
  lcd.setCursor(0, 0);
  lcd.print("Goal 1");

  // More Time-tracking Set Up
  setTime(8, 59, 50, 7, 7, 2025); // (Hour - 24H, Minute, Second, Day, Month, Year)
  setGoalDay(); // Sets the initial changingGoalDay
  checkAndChangeOutput(); // Sets the initial output for second row

  // More LCD Set Up (COULD POSSIBLY REMOVE)
  lcd.setCursor(0,1);
  lcd.print(originalLine.substring(0, 16));

  // More Button Set Up
  pinMode(buttonPin, INPUT_PULLUP);

}

void loop() {  

  checkButton(); // Checks if button has been pressed
  incrementDaysPassed(); // Increments totalDaysPassed if weekday() changes

}

// Custom modulus function
int mod7(int n) {
    return (n % 7 == 0) ? 7 : (n % 7);
}

// Makes sure the larger one is goalDay2 and smaller is goalDay1
void arrangeGoalDays() {

  if (goalDay2 < goalDay1) {
      int temp = goalDay1;
      goalDay1 = goalDay2;
      goalDay2 = temp;
  }

}

// Sets the initial changingGoalDay
void setGoalDay() {

  totalDaysPassed = weekday();
  if (weekday() <= goalDay1) {
      changingGoalDay = goalDay1;
  }
  else if (weekday() <= goalDay2) {
      changingGoalDay = goalDay2;
  }
  else {
      changingGoalDay = 7 + goalDay1;
  }

  savedHour = hour();
  savedMinute = minute();

}

// Increments the totalDaysPassed properly
void incrementDaysPassed() {
  
  // Update totalDaysPassed
  if (mod7(totalDaysPassed) != weekday()) {
    totalDaysPassed++;
    if (((mod7(totalDaysPassed) > goalDay1) && hasBeenPressed) || ((mod7(totalDaysPassed) > goalDay2) && hasBeenPressed)) {
        hasBeenPressed = false;
    }
    checkAndChangeOutput();
  }

  // Update savedHour and minute
  if (savedHour != hour()) {
    savedHour = hour();
  }
  if (savedMinute != minute()) {
    savedMinute = minute();
  }

  if (totalDaysPassed == changingGoalDay) {
    checkAndChangeOutput();
    if (hour() == 23) {
    checkAndChangeOutput();
  }
  }
}

// Prints second row of information
void printSecondRow() {

  lcd.setCursor(0, 1);
  lcd.print(originalLine.substring(0, 16));

}

// Checks to see if any information has changed and changes the output
void checkAndChangeOutput() {

  if (totalDaysPassed <= changingGoalDay && hasBeenPressed == false) {
    if (totalDaysPassed == changingGoalDay) {
      originalLine = "";
      originalLine += 23 - hour();
      originalLine += "h Left - ";
      originalLine += daysOfTheWeek[mod7(changingGoalDay)];
      if (hour() == 23) {
        originalLine = "";
        originalLine += 59 - minute();
        originalLine += "m Left - ";
        originalLine += daysOfTheWeek[mod7(changingGoalDay)];
      }
    }
    else {
      originalLine = "";
      originalLine += changingGoalDay - totalDaysPassed;
      originalLine += "d Left - ";
      originalLine += daysOfTheWeek[mod7(changingGoalDay)];
    }
  }
  else if (totalDaysPassed <= changingGoalDay && hasBeenPressed == true) {
    originalLine = "";
    originalLine = "Task complete.  ";
  }
  else if (totalDaysPassed > changingGoalDay) {
    originalLine = "";
    originalLine += totalDaysPassed - changingGoalDay;
    originalLine += "d Late - ";
    originalLine += daysOfTheWeek[mod7(changingGoalDay)];
  }

  printSecondRow();

}

// Checks if button has been pressed and for how long
void checkButton() {
  static bool buttonHeld = false;
  static unsigned long pressStart = 0;

  int state = digitalRead(buttonPin);

  // Button just pressed
  if (state == LOW && !buttonHeld) {
    pressStart = millis();
    buttonHeld = true;
  }

  // Button just released
  if (state == HIGH && buttonHeld) {
    unsigned long pressDuration = millis() - pressStart;

    if (pressDuration < 250) {
      // Short press logic
      if (changingGoalDay < totalDaysPassed) {
        while (changingGoalDay < totalDaysPassed) {
          incrementGoalDay();
        }
        hasBeenPressed = false;
      } 
      else if (hasBeenPressed == false) {
        incrementGoalDay();
        hasBeenPressed = true;
      }
      lcd.setCursor(0, 1);
      lcd.print("Task complete.  ");
      delay(750);
      lcd.setCursor(0, 1);
      lcd.print("                ");
      delay(500);
      lcd.setCursor(0, 1);
      lcd.print("Task complete.  ");
      delay(750);
      lcd.setCursor(0, 1);
      lcd.print("                ");
      checkAndChangeOutput();

    } else {
      // Long press logic
      decrementGoalDay();
      lcd.setCursor(0, 1);
      lcd.print("Reset.          ");
      delay(250);
      checkAndChangeOutput();
    }

    // Reset state
    buttonHeld = false;
  }
}

// Increments the changingGoalDay depending on parameters
void incrementGoalDay() {
    
    if (mod7(changingGoalDay) == goalDay1) {
        changingGoalDay += goalDay2 - goalDay1;
    }
    else if (mod7(changingGoalDay) == goalDay2) {
        changingGoalDay +=  7 - goalDay2 + goalDay1;
    }
    
}

// Decrements the changingGoalDay depending on parameters
void decrementGoalDay() {
    if (mod7(changingGoalDay) == goalDay1) {
        changingGoalDay -= goalDay1;
        changingGoalDay -= (7-goalDay2);
    }
    else if (mod7(changingGoalDay) == goalDay2) {
        changingGoalDay -=  (goalDay2 - goalDay1);
    }
    
    hasBeenPressed = false;
}
