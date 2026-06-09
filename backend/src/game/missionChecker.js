// src/game/missionChecker.js

function checkMission(mission, player, roundData) {
  const { answers, votes } = roundData;
  const myAnswer = answers[player.id] || "";
  const myVoteCount = votes ? Object.values(votes).filter(v => v === player.id).length : 0;

  switch (mission.checkFn) {
    case "checkNoVote":
      return myVoteCount === 0;

    case "checkMostVotes": {
      const voteCounts = {};
      if (votes) {
        Object.values(votes).forEach(v => {
          voteCounts[v] = (voteCounts[v] || 0) + 1;
        });
      }
      const maxVotes = Math.max(...Object.values(voteCounts), 0);
      return myVoteCount >= 2 && myVoteCount === maxVotes;
    }

    case "checkMoneyWord": {
      const lower = myAnswer.toLowerCase();
      const count = (lower.match(/uang|duit/g) || []).length;
      return count >= 3;
    }

    case "checkShortAnswer":
      return myAnswer.trim().split(/\s+/).length < 5;

    case "checkLongAnswer":
      return myAnswer.trim().split(/\s+/).length > 20;

    case "checkQuestionAnswer":
      return myAnswer.trim().endsWith("?");

    case "checkEnglish": {
      const englishWords = myAnswer.match(/\b[a-zA-Z]{3,}\b/g) || [];
      const indonesianCommon = new Set(["yang","dan","ini","itu","juga","untuk","dengan","dari","ke","di","ada","bisa","tidak","saya","kami","kita","mereka","dia","aku","kamu","mau","buat","punya","kalau","tapi","atau","karena","jika","sama","satu","dua","tiga","lebih","sudah","belum","akan","bisa","pergi","dapat","pagi","malam","hari","bulan","tahun"]);
      const trueEnglish = englishWords.filter(w => !indonesianCommon.has(w.toLowerCase()));
      return trueEnglish.length >= 3;
    }

    case "checkSpecific":
      return /\d/.test(myAnswer) || /[A-Z][a-z]+/.test(myAnswer);

    case "checkMatchTwo": {
      // Heuristic: answer similarity > 50% (shared words)
      const myWords = new Set(myAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      let matchCount = 0;
      Object.entries(answers).forEach(([pid, ans]) => {
        if (pid === player.id) return;
        const otherWords = new Set(ans.toLowerCase().split(/\s+/).filter(w => w.length > 3));
        const shared = [...myWords].filter(w => otherWords.has(w));
        if (shared.length >= 2 || (myWords.size > 0 && shared.length / myWords.size > 0.4)) {
          matchCount++;
        }
      });
      return matchCount >= 2;
    }

    case "checkCopySomeone": {
      const myWords = new Set(myAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      for (const [pid, ans] of Object.entries(answers)) {
        if (pid === player.id) continue;
        const otherWords = ans.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const shared = otherWords.filter(w => myWords.has(w));
        if (otherWords.length > 0 && shared.length / otherWords.length >= 0.5) return true;
      }
      return false;
    }

    default:
      return false;
  }
}

module.exports = { checkMission };
