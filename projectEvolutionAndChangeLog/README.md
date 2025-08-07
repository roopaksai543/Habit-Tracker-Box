# Project Evolution and Changelog

I began this project by building the most basic version of the system. This initial setup used an **Arduino Nano**, a **16x2 LCD (without I2C)**, and a **4-pin momentary push button** on a breadboard. With this configuration, I developed the first functional version of the code.

In **Version 1 (V1)**, instead of using a hardware time module, I used the `<TimeLib.h>` Arduino Time Library by **Paul Stoffregen** to simulate timekeeping. I had to set up a mock date and time to test my code. This system allowed me to display the goal and the number of days remaining from the mock date to the goal date. The information I wanted to display exceeded 16 characters, so I implemented a scrolling feature specifically for the bottom row.

**V1 had several bugs, questionable design decisions, and poor code structure**—all of which were addressed and improved upon in the subsequent versions listed below.

### V2
- **Fixed Bug:** After a missed deadline, pressing the button would display `"Task Complete"` for a day before updating to the correct `"Days till"` message the next day. The display now updates immediately.
- **Simplified** the `daysOfTheWeek[]` array entries:
  `"Monday"` → `"Mon"`
- **Updated** the “days until goal” display format:
  `"Days till goal: 3 - Complete by Wednesday"` → `"3d Left - Wed"`
- **Updated** the “days after goal” display format:
  `"PAST DATE by: 2"` → `"2d Late - Wed"`



### V3
- **Removed** second-row scrolling.
- **Removed** the 200ms delay in the `printSecondRow()` function for more accurate timing.
- **Moved** the call to `printSecondRow()` from `loop()` to `checkAndChangeOutput()`.
- **Removed** the unused `String shiftableLine` variable.



### V4.1
- **Implemented** hour-based countdown when the current day is the goal day (e.g., `"12h Left - Wed"`).
- **Introduced** a new global variable: `int savedHour`, set in `setGoalDay()`.
- **Implemented** minute-based countdown when within the final hour (e.g., `"30m Left - Wed"`).
- **Introduced** a new global variable: `int savedMinute`, also used in `setGoalDay()`.
- **Changed** `"Thurs"` to `"Thur"` in the `daysOfTheWeek` array.



### V4.2
- **Began** development of dual-screen integration (non-I2C).
- **Refactored** display logic into a new class named `lcdDisplay` to simplify setup and allow support for multiple LCD screens.



### V4.3
- **Introduced** a second display option via a new class.
- **Renamed** the original class from `lcdDisplay` to `firstOptionLCD`.
- **Created** a new class named `secondOptionLCD`.



### V5
- **Forked** from **V4.3**.
- **Integrated** the **DS3231 RTC module**.
- **Switched** from **Arduino Nano** to **Arduino Uno**.
- **Replaced** regular LCDs with **LCDs using I2C backpacks**.
- **Removed** the custom modulus function `mod7()`.
- **Implemented** kill switch button functionality.



### V6
- **Fixed Bug:** Supplying duplicate or invalid day indexes caused the system to freeze. This issue is now resolved.
- **Implemented** template placeholder to allow **Code Download** website to generate custom code
