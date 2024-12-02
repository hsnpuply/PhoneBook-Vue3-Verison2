const convertNumbersToPersian = (text) => {
    const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  
    let result = text;
    for (let i = 0; i < englishNumbers.length; i++) {
      const regex = new RegExp(englishNumbers[i], "g");
      result = result.replace(regex, persianNumbers[i]);
    }
    return result;
  };

  export default convertNumbersToPersian;