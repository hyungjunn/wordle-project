const ANSWER_LENGTH = 5;
const ROUNDS = 6;

const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");

let expectedWord = "";
let currentRow = 0;
let answer;

const commit = async function () {
  if (ANSWER_LENGTH !== expectedWord.length) return;
  await validateWord(expectedWord);
};

const getAnswer = async function () {
  setLoading(false);
  const url = "https://words.dev-apis.com/word-of-the-day";
  try {
    const response = await fetch(url);
    const { word } = await response.json();
    answer = word.toUpperCase();
    console.log(answer);
  } catch (err) {
    console.error(err);
  }
};

const validateWord = async function (word) {
  setLoading(true);

  const url = "https://words.dev-apis.com/validate-word";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ word: `${word}` }),
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const { validWord } = await response.json();

  console.log(validWord);

  setLoading(false);

  // 다 틀린 경우
  if (!validWord) {
    markInvalid();
    return;
  }

  let allRight = true;

  const expectedParts = expectedWord.split("");
  const answerParts = answer.split("");
  const map = makeMap(answerParts);
  // 맞춘 경우
  for (let i = 0; i < ANSWER_LENGTH; i++) {
    if (expectedParts[i] === answerParts[i]) {
      letters[i + ANSWER_LENGTH * currentRow].classList.add("correct");
      map[expectedParts[i]]--;
    }
  }

  // 근접한 경우
  for (let i = 0; i < ANSWER_LENGTH; i++) {
    if (expectedParts[i] === answerParts[i]) {
      // do nothing
    } else if (
      answerParts.includes(expectedParts[i]) &&
      map[expectedParts[i]] >= 1
    ) {
      allRight = false;
      letters[i + ANSWER_LENGTH * currentRow].classList.add("close");
      map[expectedParts[i]]--;
    } else {
      allRight = false;
      letters[i + ANSWER_LENGTH * currentRow].classList.add("wrong");
    }
  }

  currentRow++;
  expectedWord = "";
  if (allRight) {
    document.querySelector(".brand").classList.add("winner");
    alert("You win!!!");
  } else if (ROUNDS === currentRow) {
    alert(`You are lose. The Answer is ${answer}`);
  }
};

const setLoading = function (isLoading) {
  loadingDiv.classList.toggle("show", isLoading);
};

const isLetter = function (letter) {
  return /^[a-zA-Z]$/.test(letter);
};

const markInvalid = function () {
  for (let i = 0; i < ANSWER_LENGTH; i++) {
    letters[i + ANSWER_LENGTH * currentRow].classList.add("invalid");
  }
  currentRow++;
  expectedWord = "";
};

const makeMap = function (array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    if (obj[array[i]]) {
      obj[array[i]]++;
    } else {
      obj[array[i]] = 1;
    }
  }
  return obj;
};

const backspace = function () {
  if (expectedWord === "") return;
  letters[expectedWord.length + ANSWER_LENGTH * currentRow - 1].innerText = "";
  expectedWord = expectedWord.slice(0, expectedWord.length - 1);
  expectedWord.length--;
};

const keyRender = function (letter) {
  if (expectedWord.length < ANSWER_LENGTH) {
    expectedWord += letter;
  } else {
    expectedWord = expectedWord.slice(0, expectedWord.length - 1) + letter;
  }
  letters[expectedWord.length + ANSWER_LENGTH * currentRow - 1].innerText =
    letter;
};

const init = async function () {
  await getAnswer();
  const pressKey = function () {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Backspace") {
        backspace();
      } else if (event.key === "Enter") {
        commit();
      } else if (isLetter(event.key)) {
        keyRender(event.key.toUpperCase());
      }
      // do nothing
      return;
    });
  };
  pressKey();
};

init();
