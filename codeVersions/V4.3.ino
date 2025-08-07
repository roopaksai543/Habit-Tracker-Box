#include <LiquidCrystal.h>
#include <TimeLib.h>

// Custom modulus function
int mod7(int n) {
    return (n % 7 == 0) ? 7 : (n % 7);
}

// Time-tracking Set Up
const char* daysOfTheWeek[] = {
  "Error", "Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"
};

// Class for first option of goal setting
class firstOptionLCD {

  public:
  String goalName = "";
  int goalDay1 = 0;
  int goalDay2 = 0;
  String originalSecondRowLine = "";
  int totalDaysPassed;
  int changingGoalDay;
  int savedHour;
  int savedMinute;
  // Button Set Up
  int buttonPin;
  int buttonState = 0;
  bool hasBeenPressed = false;
  bool buttonHeld = false;
  unsigned long pressStart = 0;
  //I/O Pins
  int rsPin = 0;
  int enPin = 0;
  int d4Pin = 0;
  int d5Pin = 0;
  int d6Pin = 0;
  int d7Pin = 0;
  LiquidCrystal lcd;

  // Constructor
  firstOptionLCD(String goalName_, int goalDay1_, int goalDay2_, int rsPin_, int enPin_, int d4Pin_, int d5Pin_, int d6Pin_, int d7Pin_, int buttonPin_) : lcd(rsPin_, enPin_, d4Pin_, d5Pin_, d6Pin_, d7Pin_) {
    goalName = goalName_;
    goalDay1 = goalDay1_;
    goalDay2 = goalDay2_;
    rsPin = rsPin_;
    enPin = enPin_;
    d4Pin = d4Pin_;
    d5Pin = d5Pin_;
    d6Pin = d6Pin_;
    d7Pin = d7Pin_;
    buttonPin = buttonPin_;
  }

  lcdSetup() {

    // Makes sure the larger one is goalDay2 and smaller is goalDay1
    arrangeGoalDays();

    // More LCD1 Set Up
    lcd.begin(16, 2);
    lcd.setCursor(0, 0);
    lcd.print(goalName);

    setGoalDay(); // Sets the initial changingGoalDay
    checkAndChangeOutput(); // Sets the initial output for second row

    pinMode(buttonPin, INPUT_PULLUP); // Button Setup
    
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
    lcd.print(originalSecondRowLine.substring(0, 16));

  }

  // Checks to see if any information has changed and changes the output
  void checkAndChangeOutput() {

    if (totalDaysPassed <= changingGoalDay && hasBeenPressed == false) {
      if (totalDaysPassed == changingGoalDay) {
        originalSecondRowLine = "";
        originalSecondRowLine += 23 - hour();
        originalSecondRowLine += "h Left - ";
        originalSecondRowLine += daysOfTheWeek[mod7(changingGoalDay)];
        if (hour() == 23) {
          originalSecondRowLine = "";
          originalSecondRowLine += 59 - minute();
          originalSecondRowLine += "m Left - ";
          originalSecondRowLine += daysOfTheWeek[mod7(changingGoalDay)];
        }
      }
      else {
        originalSecondRowLine = "";
        originalSecondRowLine += changingGoalDay - totalDaysPassed;
        originalSecondRowLine += "d Left - ";
        originalSecondRowLine += daysOfTheWeek[mod7(changingGoalDay)];
      }
    }
    else if (totalDaysPassed <= changingGoalDay && hasBeenPressed == true) {
      originalSecondRowLine = "";
      originalSecondRowLine = "Task complete.  ";
    }
    else if (totalDaysPassed > changingGoalDay) {
      originalSecondRowLine = "";
      originalSecondRowLine += totalDaysPassed - changingGoalDay;
      originalSecondRowLine += "d Late - ";
      originalSecondRowLine += daysOfTheWeek[mod7(changingGoalDay)];
    }

    printSecondRow();

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

  // Checks if button has been pressed and for how long
  void checkButton() {

    int state = digitalRead(buttonPin);

    // Button just pressed
    if (state == LOW && !buttonHeld) {
      pressStart = millis();
      buttonHeld = true;

      lcd.setCursor(0, 1);
      lcd.print("                ");
      
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
        delay(250);
        lcd.setCursor(0, 1);
        lcd.print("                ");
        delay(250);
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


};

// Class for second option of goal setting
class secondOptionLCD {

  public:
  String goalName = "";
  int resetDay = 0;
  String originalSecondRowLine = "";
  int timesPerWeek;
  int savedWeekday = 0;
  // Button Set Up
  int buttonPin;
  int buttonState = 0;
  bool hasBeenPressed = false;
  bool buttonHeld = false;
  unsigned long pressStart = 0;
  int numOfTimesPressed = 0;
  //I/O Pins
  int rsPin = 0;
  int enPin = 0;
  int d4Pin = 0;
  int d5Pin = 0;
  int d6Pin = 0;
  int d7Pin = 0;
  LiquidCrystal lcd;

  // Constructor
  secondOptionLCD(String goalName_, int resetDay_, int rsPin_, int enPin_, int d4Pin_, int d5Pin_, int d6Pin_, int d7Pin_, int buttonPin_, int timesPerWeek_) : lcd(rsPin_, enPin_, d4Pin_, d5Pin_, d6Pin_, d7Pin_) {
    goalName = goalName_;
    resetDay = resetDay_;
    rsPin = rsPin_;
    enPin = enPin_;
    d4Pin = d4Pin_;
    d5Pin = d5Pin_;
    d6Pin = d6Pin_;
    d7Pin = d7Pin_;
    buttonPin = buttonPin_;
    timesPerWeek = timesPerWeek_;
  }

  lcdSetup() {

    // More LCD1 Set Up
    lcd.begin(16, 2);
    lcd.setCursor(0, 0);
    lcd.print(goalName);

    checkAndChangeOutput(); // Sets the initial output for second row

    pinMode(buttonPin, INPUT_PULLUP); // Button Setup
    
  }

  // Increments the totalDaysPassed properly
  void incrementDaysPassed() {
    
    // Update totalDaysPassed
    if (savedWeekday != weekday()) {
      savedWeekday = weekday();
      if (savedWeekday == resetDay) {
        numOfTimesPressed = 0;
      }
      checkAndChangeOutput();
    }
  }

  // Prints second row of information
  void printSecondRow() {

    lcd.setCursor(0, 1);
    lcd.print(originalSecondRowLine.substring(0, 16));

  }

  // Checks to see if any information has changed and changes the output
  void checkAndChangeOutput() {

    if (timesPerWeek > numOfTimesPressed && weekday() <= resetDay) {
      originalSecondRowLine = "";
      originalSecondRowLine += numOfTimesPressed;
      originalSecondRowLine += "/";
      originalSecondRowLine += timesPerWeek; 
      originalSecondRowLine += "  ";
      originalSecondRowLine += resetDay - weekday();
      originalSecondRowLine += "d - ";
      originalSecondRowLine += daysOfTheWeek[resetDay];
    }
    else if (timesPerWeek > numOfTimesPressed && weekday() > resetDay) {
      originalSecondRowLine = "";
      originalSecondRowLine += numOfTimesPressed;
      originalSecondRowLine += "/";
      originalSecondRowLine += timesPerWeek; 
      originalSecondRowLine += "  ";
      originalSecondRowLine += 7 - weekday() + resetDay;
      originalSecondRowLine += "d - ";
      originalSecondRowLine += daysOfTheWeek[resetDay];
    }
    else if (timesPerWeek <= numOfTimesPressed) {
      originalSecondRowLine = "";
      originalSecondRowLine += "Task complete.";
    }

    printSecondRow();

  }

  // Checks if button has been pressed and for how long
  void checkButton() {

    int state = digitalRead(buttonPin);

    // Button just pressed
    if (state == LOW && !buttonHeld) {
      pressStart = millis();
      buttonHeld = true;

      lcd.setCursor(0, 1);
      lcd.print("                ");
      
    }

    // Button just released
    if (state == HIGH && buttonHeld) {
      unsigned long pressDuration = millis() - pressStart;
      
      if (pressDuration < 250) {
        // Short press logic
        numOfTimesPressed++;
        String temp = "";
        temp += "Complete. ";
        temp += numOfTimesPressed;
        temp += "/";
        temp += timesPerWeek;
        lcd.setCursor(0, 1);
        lcd.print("Task complete.  ");
        delay(250);
        lcd.setCursor(0, 1);
        lcd.print("                ");
        delay(250);
        checkAndChangeOutput();

      } else {
        // Long press logic
        numOfTimesPressed--;
        if (numOfTimesPressed < 0) {
          numOfTimesPressed = 0;
        }
        lcd.setCursor(0, 1);
        lcd.print("Reset.          ");
        delay(250);
        checkAndChangeOutput();
      }

      // Reset state
      buttonHeld = false;
    }
  }


};

// Initializing both LCD's (with random input)
firstOptionLCD lcd1("Goal 1", 4, 7, 8, 9, 10, 11, 12, 13, A0);
secondOptionLCD lcd2("Goal 2", 7, 2, 3, 4, 5, 6, 7, A1, 4);

void setup() {

  // Used for debugging
  Serial.begin(9600);

  // More Time-tracking Set Up
  setTime(23, 59, 50, 5, 7, 2025); // (Hour - 24H, Minute, Second, Day, Month, Year)

  // lcd1 and lcd2 Setup
  lcd1.lcdSetup();
  lcd2.lcdSetup();

}

void loop() {  

  lcd1.checkButton(); // Checks if button has been pressed
  lcd2.checkButton(); // Checks if button has been pressed
  lcd1.incrementDaysPassed(); // Increments totalDaysPassed if weekday() changes
  lcd2.incrementDaysPassed(); // Increments totalDaysPassed if weekday() changes

}
