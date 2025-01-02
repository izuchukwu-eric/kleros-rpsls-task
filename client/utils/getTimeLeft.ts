const getTimeLeft = (timeout: number, lastAction: number) => {
    return (
      Number(BigInt(timeout)) * 1000 -
      (new Date().getTime() - Number(BigInt(lastAction)) * 1000)
    );
};
  
export default getTimeLeft;  