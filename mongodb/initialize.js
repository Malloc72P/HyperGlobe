main();

function main() {
  const cfg = {
    _id: 'rs0',
    members: [{ _id: 0, host: 'localhost:27017' }],
  };

  try {
    rs.initiate(cfg);
  } catch (e) {
    if (e.codeName !== 'AlreadyInitialized') throw e;
  }

  // PRIMARY 될 때까지 대기
  while (!rs.isMaster().ismaster) {
    print('⏳  Waiting for PRIMARY…');
    sleep(1000);
  }

  const admin = db.getSiblingDB('admin');

  // admin 유저가 없다면 생성
  if (!admin.getUser('admin')) {
    admin.createUser({
      user: 'admin',
      pwd: 'admin',
      roles: [{ role: 'root', db: 'admin' }],
    });

    print('✅  root user created');
  }
}
