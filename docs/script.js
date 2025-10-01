class HabitInformation {
  selectedDisplay = -1;
  habitName = "";
  selectedDays = [-1, -1];
  numOfDays = 0;
  completeDeclaration = "";

  constructor(selectedDisplay, habitName, selectedDays, numOfDays, completeDeclaration) {
    this.selectedDisplay = selectedDisplay;
    this.habitName = habitName;
    this.selectedDays = selectedDays;
    this.numOfDays = numOfDays;
    this.completeDeclaration = completeDeclaration;
  }
}

let habit1 = new HabitInformation();
let habit2 = new HabitInformation();
let habit3 = new HabitInformation();
let habit4 = new HabitInformation();
let habit5 = new HabitInformation();

document.getElementById("optionOneH1").classList.add("hidden");
document.getElementById("optionTwoH1").classList.add("hidden");
document.getElementById("optionOneH2").classList.add("hidden");
document.getElementById("optionTwoH2").classList.add("hidden");
document.getElementById("optionOneH3").classList.add("hidden");
document.getElementById("optionTwoH3").classList.add("hidden");
document.getElementById("optionOneH4").classList.add("hidden");
document.getElementById("optionTwoH4").classList.add("hidden");
document.getElementById("optionOneH5").classList.add("hidden");
document.getElementById("optionTwoH5").classList.add("hidden");

let baseCode = `

#include <Wire.h>
#include <RTClib.h>
#include <LiquidCrystal_I2C.h>

// Time-tracking Set Up
const char* daysOfTheWeek[] = {
  "Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"
};

// RTC Setup
RTC_DS3231 rtc;
DateTime now;

// killSwitch Setup
int killSwitchButtonPin = 7;

// Class for first option of goal setting
class firstOptionLCD {

  public:
  String goalName = "";
  int goalDay1 = 0;
  int goalDay2 = 0;
  String originalSecondRowLine = "";
  String lastSecondRowLine = "";
  int totalDaysPassed = 0;
  int changingGoalDay = 0;
  int savedHour;
  int savedMinute;
  // Button Set Up
  int buttonPin = 0;
  int buttonState = 0;
  bool hasBeenPressed = false;
  bool buttonHeld = false;
  unsigned long pressStart = 0;
  //I/O 
  int lcdAddress;
  //LiquidCrystal lcd;
  LiquidCrystal_I2C lcd;

  // Constructor
  firstOptionLCD(String goalName_, int goalDay1_, int goalDay2_, int lcdAddress_, int buttonPin_) : lcd(lcdAddress_, 16, 2) {
    goalName = goalName_;
    goalDay1 = goalDay1_;
    goalDay2 = goalDay2_;
    lcdAddress = lcdAddress_;
    buttonPin = buttonPin_;
  }

  void lcdSetup() {

    // Makes sure the larger one is goalDay2 and smaller is goalDay1
    arrangeGoalDays();

    // More LCD1 Set Up
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print(goalName);

    // Check if rtc is working
    if (!rtc.begin()) {
      lcd.setCursor(0, 0);
      lcd.print("RTC failed");
      // while (1); // Halt
    }

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

    totalDaysPassed += now.dayOfTheWeek();
    if (now.dayOfTheWeek() <= goalDay1) {
        changingGoalDay += goalDay1;
    }
    else if (now.dayOfTheWeek() <= goalDay2) {
        changingGoalDay += goalDay2;
    }
    else {
        changingGoalDay += 7 + goalDay1;
    }

    savedHour = now.hour();
    savedMinute = now.minute();
  }

  // Increments the totalDaysPassed properly
  void incrementDaysPassed() {
    
    // Update totalDaysPassed
    if ((totalDaysPassed%7) != now.dayOfTheWeek()) {
      totalDaysPassed++;
      if (((totalDaysPassed%7 > goalDay1) && hasBeenPressed) || (((totalDaysPassed%7) > goalDay2) && hasBeenPressed)) {
          hasBeenPressed = false;
      }
      checkAndChangeOutput();
    }

    // Update savedHour and minute
    if (savedHour != now.hour()) {
      savedHour = now.hour();
    }
    if (savedMinute != now.minute()) {
      savedMinute = now.minute();
    }

    if (totalDaysPassed == changingGoalDay) {
      if (now.hour() == 23) {
      checkAndChangeOutput();
    }
    }
  }

  // Prints second row of information
  void printSecondRow() {

      lcd.setCursor(0, 1);
      lcd.print("                ");
      lcd.setCursor(0, 1);
      lcd.print(originalSecondRowLine.substring(0, 16));
      lastSecondRowLine = originalSecondRowLine;

  }

  // Checks to see if any information has changed and changes the output
  void checkAndChangeOutput() {

    if (totalDaysPassed <= changingGoalDay && hasBeenPressed == false) {
      if (totalDaysPassed == changingGoalDay) {
        originalSecondRowLine = "";
        originalSecondRowLine += 23 - now.hour();
        originalSecondRowLine += "h Left - ";
        originalSecondRowLine += daysOfTheWeek[(changingGoalDay%7)];
        if (now.hour() == 23) {
          originalSecondRowLine = "";
          originalSecondRowLine += 59 - now.minute();
          originalSecondRowLine += "m Left - ";
          originalSecondRowLine += daysOfTheWeek[(changingGoalDay%7)];
        }
      }
      else {
        originalSecondRowLine = "";
        originalSecondRowLine += changingGoalDay - totalDaysPassed;
        originalSecondRowLine += "d Left - ";
        originalSecondRowLine += daysOfTheWeek[(changingGoalDay%7)];
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
      originalSecondRowLine += daysOfTheWeek[(changingGoalDay%7)];
    }

    printSecondRow();

  }

  // Increments the changingGoalDay depending on parameters
  void incrementGoalDay() {

    if (goalDay1 == goalDay2) {
        changingGoalDay += 7;
    }  
    else if ((changingGoalDay%7) == goalDay1) {
        changingGoalDay += goalDay2 - goalDay1;
    }
    else if ((changingGoalDay%7) == goalDay2) {
        changingGoalDay +=  7 - goalDay2 + goalDay1;
    }
      
  }
  
  // Decrements the changingGoalDay depending on parameters
  void decrementGoalDay() {

    if (goalDay1 == goalDay2) {
      changingGoalDay -= 7;
    }
    else if ((changingGoalDay%7) == goalDay1) {
      changingGoalDay -= goalDay1;
      changingGoalDay -= (7-goalDay2);
    }
    else if ((changingGoalDay%7) == goalDay2) {
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

  // Turns off backlight
  void offBacklight() {
    lcd.noBacklight();
  }

  // Turns on backlight
  void onBacklight() {
    lcd.backlight();
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
  int buttonPin = 0;
  int buttonState = 0;
  bool hasBeenPressed = false;
  bool buttonHeld = false;
  unsigned long pressStart = 0;
  int numOfTimesPressed = 0;
  //I/O 
  int lcdAddress;
  //LiquidCrystal lcd;
  LiquidCrystal_I2C lcd;

  // Constructor
  secondOptionLCD(String goalName_, int resetDay_, int timesPerWeek_, int lcdAddress_, int buttonPin_) : lcd(lcdAddress_, 16, 2) {
    goalName = goalName_;
    resetDay = resetDay_;
    timesPerWeek = timesPerWeek_;
    lcdAddress = lcdAddress_;
    buttonPin = buttonPin_;
  }

  void lcdSetup() {

    // More LCD1 Set Up
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print(goalName);

    if (!rtc.begin()) {
      lcd.setCursor(0, 0);
      lcd.print("RTC failed");
      //while (1); // Halt
    }


    checkAndChangeOutput(); // Sets the initial output for second row

    pinMode(buttonPin, INPUT_PULLUP); // Button Setup
    
  }

  // Increments the totalDaysPassed properly
  void incrementDaysPassed() {
    
    // Update totalDaysPassed
    if (savedWeekday != now.dayOfTheWeek()) {
      savedWeekday = now.dayOfTheWeek();
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

    if (timesPerWeek > numOfTimesPressed && now.dayOfTheWeek() <= resetDay) {
      originalSecondRowLine = "";
      originalSecondRowLine += numOfTimesPressed;
      originalSecondRowLine += "/";
      originalSecondRowLine += timesPerWeek; 
      originalSecondRowLine += "  ";
      originalSecondRowLine += resetDay - now.dayOfTheWeek();
      originalSecondRowLine += "d - ";
      originalSecondRowLine += daysOfTheWeek[resetDay];
    }
    else if (timesPerWeek > numOfTimesPressed && now.dayOfTheWeek() > resetDay) {
      originalSecondRowLine = "";
      originalSecondRowLine += numOfTimesPressed;
      originalSecondRowLine += "/";
      originalSecondRowLine += timesPerWeek; 
      originalSecondRowLine += "  ";
      originalSecondRowLine += 7 - now.dayOfTheWeek() + resetDay;
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
        if (numOfTimesPressed > timesPerWeek) {
          numOfTimesPressed = timesPerWeek;
        }
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

  // Turns off backlight
  void offBacklight() {
    lcd.noBacklight();
  }

  // Turns on backlight
  void onBacklight() {
    lcd.backlight();
  }


};

// Initializing both LCD's
{{COMPLETED_DECLARATION_H1}}
{{COMPLETED_DECLARATION_H2}}
{{COMPLETED_DECLARATION_H3}}
{{COMPLETED_DECLARATION_H4}}
{{COMPLETED_DECLARATION_H5}}

void checkKillSwitch() {

  if (digitalRead(killSwitchButtonPin)) {
    lcd1.onBacklight();
    lcd2.onBacklight();
    lcd3.onBacklight();
    lcd4.onBacklight();
    lcd5.onBacklight();
  } else {
    lcd1.offBacklight();
    lcd2.offBacklight();
    lcd3.offBacklight();
    lcd4.offBacklight();
    lcd5.offBacklight();
  }

}

void setup() {

  // Used for debugging
  Serial.begin(9600);

  // lcd1 and lcd2 Setup
  lcd1.lcdSetup();
  lcd2.lcdSetup();
  lcd3.lcdSetup();
  lcd4.lcdSetup();
  lcd5.lcdSetup();

  // killSwitch Setup
  pinMode(7, INPUT_PULLUP);

  // Rest time - Only call once if time needs to be reset
  rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  
}

void loop() {  

  now = rtc.now();

  lcd1.checkButton(); // Checks if button has been pressed
  lcd1.incrementDaysPassed(); // Increments totalDaysPassed if weekday() changes
  lcd2.checkButton(); // Checks if button has been pressed
  lcd2.incrementDaysPassed(); // Increments totalDaysPassed if weekday() changes
  lcd3.checkButton(); // Checks if button has been pressed
  lcd3.incrementDaysPassed(); // Increments totalDaysPassed if weekday() changes
  lcd4.checkButton(); // Checks if button has been pressed
  lcd4.incrementDaysPassed(); // Increments totalDaysPassed if weekday() changes
  lcd5.checkButton(); // Checks if button has been pressed
  lcd5.incrementDaysPassed(); // Increments totalDaysPassed if weekday() changes

  // killSwitch code
  checkKillSwitch();
  
}

`

document.getElementById("codeForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Habit 1
  if (habit1.selectedDisplay == 0) {
    habit1.selectedDays = Array.from(document.querySelectorAll('.checkBoxes11:checked')).map(cb => cb.value);
    if (habit1.selectedDays[1] == -1 || habit1.selectedDays.length === 1) {
      habit1.habitName = document.getElementById("habitName11").value;
      habit1.completeDeclaration = `firstOptionLCD lcd1("${habit1.habitName}", ${habit1.selectedDays[0]}, ${habit1.selectedDays[0]}, 0x27, 2);`;
    }
    else {
      habit1.habitName = document.getElementById("habitName11").value;
      habit1.completeDeclaration = `firstOptionLCD lcd1("${habit1.habitName}", ${habit1.selectedDays[0]}, ${habit1.selectedDays[1]}, 0x27, 2);`;
    }
  }
  else {
    habit1.selectedDays = Array.from(document.querySelectorAll('.checkBoxes12:checked')).map(cb => cb.value);
    habit1.habitName = document.getElementById("habitName12").value;
    habit1.numOfDays = document.getElementById("timesPerWeek12").value;
    habit1.completeDeclaration = `secondOptionLCD lcd1("${habit1.habitName}", ${habit1.selectedDays[0]}, ${habit1.numOfDays}, 0x27, 2);`;
  }

  if (habit2.selectedDisplay == 0) {
    habit2.selectedDays = Array.from(document.querySelectorAll('.checkBoxes21:checked')).map(cb => cb.value);
    if (habit2.selectedDays[1] == -1 || habit2.selectedDays.length === 1) {
      habit2.habitName = document.getElementById("habitName21").value;
      habit2.completeDeclaration = `firstOptionLCD lcd2("${habit2.habitName}", ${habit2.selectedDays[0]}, ${habit2.selectedDays[0]}, 0x26, 3);`;
    } 
    else {
      habit2.habitName = document.getElementById("habitName21").value;
      habit2.completeDeclaration = `firstOptionLCD lcd2("${habit2.habitName}", ${habit2.selectedDays[0]}, ${habit2.selectedDays[1]}, 0x26, 3);`;
    }
  } 
  else {
    habit2.selectedDays = Array.from(document.querySelectorAll('.checkBoxes22:checked')).map(cb => cb.value);
    habit2.habitName = document.getElementById("habitName22").value;
    habit2.numOfDays = document.getElementById("timesPerWeek22").value;
    habit2.completeDeclaration = `secondOptionLCD lcd2("${habit2.habitName}", ${habit2.selectedDays[0]}, ${habit2.numOfDays}, 0x26, 3);`;
  }
  
  // Habit 3
  if (habit3.selectedDisplay == 0) {
    habit3.selectedDays = Array.from(document.querySelectorAll('.checkBoxes31:checked')).map(cb => cb.value);
    if (habit3.selectedDays[1] == -1 || habit3.selectedDays.length === 1) {
      habit3.habitName = document.getElementById("habitName31").value;
      habit3.completeDeclaration = `firstOptionLCD lcd3("${habit3.habitName}", ${habit3.selectedDays[0]}, ${habit3.selectedDays[0]}, 0x25, 4);`;
    } 
    else {
      habit3.habitName = document.getElementById("habitName31").value;
      habit3.completeDeclaration = `firstOptionLCD lcd3("${habit3.habitName}", ${habit3.selectedDays[0]}, ${habit3.selectedDays[1]}, 0x25, 4);`;
    }
  } 
  else {
    habit3.selectedDays = Array.from(document.querySelectorAll('.checkBoxes32:checked')).map(cb => cb.value);
    habit3.habitName = document.getElementById("habitName32").value;
    habit3.numOfDays = document.getElementById("timesPerWeek32").value;
    habit3.completeDeclaration = `secondOptionLCD lcd3("${habit3.habitName}", ${habit3.selectedDays[0]}, ${habit3.numOfDays}, 0x25, 4);`;
  }
  
  // Habit 4
  if (habit4.selectedDisplay == 0) {
    habit4.selectedDays = Array.from(document.querySelectorAll('.checkBoxes41:checked')).map(cb => cb.value);
    if (habit4.selectedDays[1] == -1 || habit4.selectedDays.length === 1) {
      habit4.habitName = document.getElementById("habitName41").value;
      habit4.completeDeclaration = `firstOptionLCD lcd4("${habit4.habitName}", ${habit4.selectedDays[0]}, ${habit4.selectedDays[0]}, 0x24, 5);`;
    } 
    else {
      habit4.habitName = document.getElementById("habitName41").value;
      habit4.completeDeclaration = `firstOptionLCD lcd4("${habit4.habitName}", ${habit4.selectedDays[0]}, ${habit4.selectedDays[1]}, 0x24, 5);`;
    }
  } 
  else {
    habit4.selectedDays = Array.from(document.querySelectorAll('.checkBoxes42:checked')).map(cb => cb.value);
    habit4.habitName = document.getElementById("habitName42").value;
    habit4.numOfDays = document.getElementById("timesPerWeek42").value;
    habit4.completeDeclaration = `secondOptionLCD lcd4("${habit4.habitName}", ${habit4.selectedDays[0]}, ${habit4.numOfDays}, 0x24, 5);`;
  }
  
  // Habit 5
  if (habit5.selectedDisplay == 0) {
    habit5.selectedDays = Array.from(document.querySelectorAll('.checkBoxes51:checked')).map(cb => cb.value);
    if (habit5.selectedDays[1] == -1 || habit5.selectedDays.length === 1) {
      habit5.habitName = document.getElementById("habitName51").value;
      habit5.completeDeclaration = `firstOptionLCD lcd5("${habit5.habitName}", ${habit5.selectedDays[0]}, ${habit5.selectedDays[0]}, 0x23, 6);`;
    } 
    else {
      habit5.habitName = document.getElementById("habitName51").value;
      habit5.completeDeclaration = `firstOptionLCD lcd5("${habit5.habitName}", ${habit5.selectedDays[0]}, ${habit5.selectedDays[1]}, 0x23, 6);`;
    }
  } 
  else {
    habit5.selectedDays = Array.from(document.querySelectorAll('.checkBoxes52:checked')).map(cb => cb.value);
    habit5.habitName = document.getElementById("habitName52").value;
    habit5.numOfDays = document.getElementById("timesPerWeek52").value;
    habit5.completeDeclaration = `secondOptionLCD lcd5("${habit5.habitName}", ${habit5.selectedDays[0]}, ${habit5.numOfDays}, 0x23, 6);`;
  }

  const finalCode = generateCode();

  window.generatedCode = finalCode;

  document.getElementById("downloadBtn").style.display = "inline";
  document.getElementById("previewBtn").style.display = "inline";
  document.getElementById("previewCode").classList.add("hidden");
});

const downloadBtn = document.getElementById("downloadBtn");
if (downloadBtn) {
  downloadBtn.addEventListener("click", function() {
    const blob = new Blob([window.generatedCode], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "custom_code.ino";
    a.click();
  });
}

function showOption(selected) {

  switch (selected[0]) {
  case '1':
    if (selected === '1one') {
      document.getElementById("optionOneH1").classList.remove("hidden");
      document.getElementById("optionTwoH1").classList.add("hidden");
      habit1.selectedDisplay = 0;
    } 
    else if (selected === '1two') {
      document.getElementById("optionTwoH1").classList.remove("hidden");
      document.getElementById("optionOneH1").classList.add("hidden");
      habit1.selectedDisplay = 1;
    }
    break;
  case '2':
    if (selected === '2one') {
      document.getElementById("optionOneH2").classList.remove("hidden");
      document.getElementById("optionTwoH2").classList.add("hidden");
      habit2.selectedDisplay = 0;
    } 
    else if (selected === '2two') {
      document.getElementById("optionTwoH2").classList.remove("hidden");
      document.getElementById("optionOneH2").classList.add("hidden");
      habit2.selectedDisplay = 1;
    }
    break;
  case '3':
    if (selected === '3one') {
      document.getElementById("optionOneH3").classList.remove("hidden");
      document.getElementById("optionTwoH3").classList.add("hidden");
      habit3.selectedDisplay = 0;
    } 
    else if (selected === '3two') {
      document.getElementById("optionTwoH3").classList.remove("hidden");
      document.getElementById("optionOneH3").classList.add("hidden");
      habit3.selectedDisplay = 1;
    }
    break;
  case '4':
    if (selected === '4one') {
      document.getElementById("optionOneH4").classList.remove("hidden");
      document.getElementById("optionTwoH4").classList.add("hidden");
      habit4.selectedDisplay = 0;
    } 
    else if (selected === '4two') {
      document.getElementById("optionTwoH4").classList.remove("hidden");
      document.getElementById("optionOneH4").classList.add("hidden");
      habit4.selectedDisplay = 1;
    }
    break;
  case '5':
    if (selected === '5one') {
      document.getElementById("optionOneH5").classList.remove("hidden");
      document.getElementById("optionTwoH5").classList.add("hidden");
      habit5.selectedDisplay = 0;
    } 
    else if (selected === '5two') {
      document.getElementById("optionTwoH5").classList.remove("hidden");
      document.getElementById("optionOneH5").classList.add("hidden");
      habit5.selectedDisplay = 1;
    }
    break;
}
  
  //document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
}
  
function limitCheckboxes(checkbox, limit, containerId) {
  
  const container = document.getElementById(containerId);
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
  
  if (checkedCount > limit) {
    checkbox.checked = false;
    alert(`You can only select up to ${limit} day(s).`);
  }
}

function generateCode() {

  if (!habit1.habitName) {
    habit1.completeDeclaration = "";
  }
  if (!habit2.habitName) {
    habit2.completeDeclaration = "";
  }
  if (!habit3.habitName) {
    habit3.completeDeclaration = "";
  }
  if (!habit4.habitName) {
    habit4.completeDeclaration = "";
  }
  if (!habit5.habitName) {
    habit5.completeDeclaration = "";
  }
  
  return baseCode
    .replace("{{COMPLETED_DECLARATION_H1}}", habit1.completeDeclaration)
    .replace("{{COMPLETED_DECLARATION_H2}}", habit2.completeDeclaration)
    .replace("{{COMPLETED_DECLARATION_H3}}", habit3.completeDeclaration)
    .replace("{{COMPLETED_DECLARATION_H4}}", habit4.completeDeclaration)
    .replace("{{COMPLETED_DECLARATION_H5}}", habit5.completeDeclaration);
  
}

document.getElementById("previewBtn").addEventListener("click", function () {
  const codeBlock = document.getElementById("previewCode");
  if (codeBlock.classList.contains("hidden")) {
    codeBlock.innerText = window.generatedCode;
    codeBlock.classList.remove("hidden");
    this.innerText = "Hide Preview";
  } 
  else {
    codeBlock.classList.add("hidden");
    this.innerText = "Preview Code";
  }
});
