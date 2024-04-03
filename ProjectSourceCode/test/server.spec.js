import server from '../src/index.js'; //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

import chai from 'chai'; // Chai HTTP provides an interface for live integration testing of the API's.
import chaiHttp from 'chai-http';
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

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


// ------ Lab 11 Part C: Test Cases ------
describe('default endpoint', () => {
    it('Returns the default welcome message', done => {
      chai
        .request(server)
        .get('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('nonexistent endpoint', () => {
    it('Returns an error', done => {
        chai 
          .request(server)
          .get('/DNE')
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
    });
  });