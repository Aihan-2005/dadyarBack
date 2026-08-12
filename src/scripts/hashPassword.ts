import bcrypt from "bcrypt";

const password = "13511351";

async function generateHash() {
  const hash = await bcrypt.hash(password, 12);

  console.log(hash);
}

generateHash();