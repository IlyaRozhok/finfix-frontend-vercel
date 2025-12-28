export const extractUserName = (fullName: string | undefined) => {
  if (!fullName?.trim()) return "newcomer";
  const dividedName = fullName.split(" ");
  if (dividedName.length !== 2) {
    return fullName;
  }

  return dividedName[0];
};
