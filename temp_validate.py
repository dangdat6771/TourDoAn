import yaml

try:
    with open('c:\\DoAnCMPM\\testDoAn\\docker-compose.yml', 'r') as f:
        yaml_data = yaml.safe_load(f)
    print('YAML Validation Results:')
    print('=' * 60)
    print('✓ YAML Syntax: VALID')
    print('✓ Successfully parsed {} top-level keys'.format(len(yaml_data)))
    print('  Keys: ' + str(list(yaml_data.keys())))
    if 'services' in yaml_data:
        print('✓ Services: ' + str(list(yaml_data['services'].keys())))
    if 'networks' in yaml_data:
        print('✓ Networks: ' + str(list(yaml_data['networks'].keys())))
    if 'volumes' in yaml_data:
        print('✓ Volumes: ' + str(list(yaml_data['volumes'].keys())))
except yaml.YAMLError as e:
    print('YAML Syntax Error: ' + str(e))
except Exception as e:
    print('Error: ' + str(e))
