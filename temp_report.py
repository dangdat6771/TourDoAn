import yaml
import os

print('=' * 70)
print('DOCKER-COMPOSE.YML VALIDATION REPORT')
print('=' * 70)

# 1. YAML Syntax Validation
print('\n[1] YAML SYNTAX VALIDATION')
print('-' * 70)
try:
    with open('c:\\DoAnCMPM\\testDoAn\\docker-compose.yml', 'r') as f:
        yaml_data = yaml.safe_load(f)
    print('Status: ✓ VALID')
    print('Result: YAML syntax is correct and file parsed successfully')
except yaml.YAMLError as e:
    print('Status: ✗ INVALID')
    print('Error: ' + str(e))

# 2. File Path Validation
print('\n[2] REFERENCED FILES VALIDATION')
print('-' * 70)
base_path = 'c:\\DoAnCMPM\\testDoAn'
referenced_files = [
    'Tour-Repo-BE\\travel-api\\Dockerfile',
    'Tour-Repo-BE\\travel-api\\initdb.sql',
    'demo-travel\\Dockerfile',
    'demo-travel\\nginx.conf'
]

all_files_exist = True
for file_path in referenced_files:
    full_path = os.path.join(base_path, file_path)
    exists = os.path.exists(full_path)
    status = '✓ EXISTS' if exists else '✗ MISSING'
    print('{} - {}'.format(status, file_path))
    if not exists:
        all_files_exist = False

# 3. Configuration Structure Validation
print('\n[3] CONFIGURATION STRUCTURE VALIDATION')
print('-' * 70)
print('Services configured: {}'.format(', '.join(yaml_data['services'].keys())))
print('Networks configured: {}'.format(', '.join(yaml_data['networks'].keys())))
print('Volumes configured: {}'.format(', '.join(yaml_data['volumes'].keys())))

# Check for critical service dependencies
print('\n[4] SERVICE DEPENDENCIES VALIDATION')
print('-' * 70)
api_service = yaml_data['services'].get('api-service', {})
frontend_service = yaml_data['services'].get('frontend', {})

if 'depends_on' in api_service:
    deps = api_service['depends_on']
    if isinstance(deps, dict):
        deps = list(deps.keys())
    print('✓ api-service depends on: {}'.format(deps))
else:
    print('✗ api-service has no dependencies defined')

if 'depends_on' in frontend_service:
    deps = frontend_service['depends_on']
    if isinstance(deps, list):
        print('✓ frontend depends on: {}'.format(deps))
    else:
        print('✓ frontend depends on: {}'.format(list(deps.keys())))
else:
    print('✗ frontend has no dependencies defined')

# Final Status
print('\n' + '=' * 70)
if all_files_exist:
    print('OVERALL STATUS: ✓ ALL VALIDATIONS PASSED')
else:
    print('OVERALL STATUS: ✗ SOME FILES ARE MISSING')
print('=' * 70)
