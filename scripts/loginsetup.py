import os

username = ''
token = ''
branch = input('Enter the remote branch: ')

os.system(f'git clone https://{username}:{token}@github.com/tobilub04/GestionDesVacatairesGroupe2.git')
os.chdir('GestionDesVacatairesGroupe2')
os.system(f'git switch {branch if branch else "main"}')
os.system('npm install')
os.system('code .')
os.system('ng serve')

print('Done.')
