export const transportOption = {
	service: 'gmail',
	host: 'smtp.gmail.com',
	port: 587,
	secure: true,
	auth: {
		user: process.env.EMAIL_ID,
		pass: process.env.EMAIL_PW,
	},
}