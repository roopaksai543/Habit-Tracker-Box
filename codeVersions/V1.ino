#include <LiquidCrystal.h>
#include <TimeLib.h>

// Set Goal Days (1 - Sunday... 7 - Saturday)
int goalDay1 = 2; // Monday
int goalDay2 = 6; // Friday

// LCD Set Up
LiquidCrystal lcd (12, 11, 9, 8, 7, 6);

// Time-tracking Set Up
const char* daysOfTheWeek[] = {
  "Error", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
};
String originalLine = "";
String shiftableLine;

// Button Set Up
const int buttonPin = 2;
int buttonState = 0;
bool hasBeenPressed = false;

// Other variables
int totalDaysPassed;
int changingGoalDay;

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
  setTime(23, 59, 50, 4, 7, 2025);
  setGoalDay(); // Sets the initial changingGoalDay
  checkAndChangeOutput(); // Sets the initial output for second row

  // More LCD Set Up 
  lcd.setCursor(0,1);
  lcd.print(shiftableLine.substring(0, 16));

  // More Button Set Up
  pinMode(buttonPin, INPUT_PULLUP);

}

void loop() {  

  checkButton(); // Checks if button has been pressed
  printSecondRow(); // Scrolls through the second row of the display
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

}

// Increments the totalDaysPassed properly
void incrementDaysPassed() {

  if (mod7(totalDaysPassed) != weekday()) {
    totalDaysPassed++;
    if (((mod7(totalDaysPassed) > goalDay1) && hasBeenPressed) || ((mod7(totalDaysPassed) > goalDay2) && hasBeenPressed)) {
        hasBeenPressed = false;
    }
    checkAndChangeOutput();
  }
}

// Scrolls through the second row of the display
void printSecondRow() {

  delay(200);

  if (shiftableLine.length() > 16) {
    char temp = shiftableLine[0];
    shiftableLine = shiftableLine.substring(1) + temp;
  }

  lcd.setCursor(0, 1);
  lcd.print(shiftableLine.substring(0, 16));

}

// Checks to see if any information has changed and changes the output
void checkAndChangeOutput() {

  if (totalDaysPassed <= changingGoalDay && hasBeenPressed == false) {
    originalLine = "";
    originalLine += "Days till goal: ";
    originalLine += changingGoalDay - totalDaysPassed;
    originalLine += " - Complete by ";
    originalLine += daysOfTheWeek[mod7(changingGoalDay)];
    originalLine += ".     ";
    shiftableLine = originalLine;
  }
  else if (totalDaysPassed <= changingGoalDay && hasBeenPressed == true) {
    originalLine = "Task complete.  ";
    shiftableLine = originalLine;
  }
  else if (totalDaysPassed > changingGoalDay) {
    originalLine = "";
    originalLine += "PAST DATE by: ";
    originalLine += totalDaysPassed - changingGoalDay;
    originalLine += ".     ";
    shiftableLine = originalLine;
  }

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
      } else if (hasBeenPressed == false) {
        incrementGoalDay();
      }
      hasBeenPressed = true;
      lcd.setCursor(0, 1);
      lcd.print("Task complete.  ");
      delay(750);
      lcd.setCursor(0, 1);
      lcd.print("                ");
      delay(500);
      lcd.setCursor(0, 1);
      lcd.print("Task complete.  ");
      delay(750);
      checkAndChangeOutput();

    } else {
      // Long press logic
      decrementGoalDay();
      checkAndChangeOutput();
      lcd.setCursor(0, 1);
      lcd.print("Reset.          ");
      delay(250);
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
