import { registerAs } from '@nestjs/config';

/*
  We can also use this approach to decompose different configs. 
  For example app.config, db.config, server.config or something else.
*/

export default registerAs('coffees', () => ({
  foo: 'bar',
}));
