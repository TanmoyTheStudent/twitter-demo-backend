let totalTweets = 0;

const setTotalTweets = (count) => {
  totalTweets = count;
};

const getTotalTweets = () => {
  return totalTweets;
};

module.exports = {
  setTotalTweets,
  getTotalTweets,
};
