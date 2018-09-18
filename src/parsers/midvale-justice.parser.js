/**
 * Page parsing steps:
 * #1. Court Heading
 * #2. Judge - Date
 * #4. Time - Court dockett number, court 'type'
 * #5. 
 */

 class MidvaleJusticeCase {
    constructor(_time, _judge) {
      this.time = _time;
      this.judge = _judge;
    }

    setPlaintiff(_plaintiff) {
      this.plaintiff = _plaintiff;
    }

    setProsecutor(_pros) {
      this.prosecutor = _pros;
    }

    setDefendant(_def) {
      this.defendant = _def;
    }

    setDefense(_defense) {
      this.defense = _defense
    }

    setCaseText(_text) {
      this.caseText = _text;
    }
 }

module.exports = MidvaleJusticeCase