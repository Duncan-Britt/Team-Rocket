// ------ Lab 11 Part B: Test Cases ------
describe('Testing Add User API', () => {
    // positive test case
    it('positive : /register', done => {
        chai
          .request(server)
          .post('/register')
          .send({username: 'test_user', email: 'test_user@nowhere.com', password: 'pa$$word'})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.message).to.equals('Success');
            done();
          });
    });

    // negative test case
    it('Negative : /register. Checking invalid email', done => {
      chai
        .request(server)
        .post('/register')
        .send({username: 'test_user2', email: 24, password: 'pa$$word'})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equals('Invalid input');
          done();
        });
    });
  });