import json
import subprocess
import tempfile
import os
import time
from rest_framework.views import APIView
from rest_framework.response import Response
from .decorators import token_required
from rest_framework import status
from .models import StudentData
import mysql.connector
from mysql.connector import Error
from cryptography.fernet import Fernet
from dotenv import load_dotenv
load_dotenv()
from django.utils.decorators import method_decorator
import json
import mysql.connector
from mysql.connector import Error, pooling
import logging
import re
import sys
from decimal import Decimal
import datetime

cipher_suite = Fernet(os.getenv('STUDENT_CONFIG_KEY'))

def decrypt_data(encrypted_data):
    decrypted_data = cipher_suite.decrypt(encrypted_data).decode()
    return json.loads(decrypted_data)


logger = logging.getLogger(__name__)

@method_decorator(token_required, name='dispatch')
class SQLQueryExecutionView(APIView):

    def post(self, request, id, *args, **kwargs):
        try:
            data = json.loads(request.body)
            queries = [data.get('Code')]
            if not queries or not isinstance(queries, list):
                return Response({"status": "error", "message": "Queries parameter missing or not a list"}, status=status.HTTP_400_BAD_REQUEST)
            
            if queries == ['']:
                return Response({"status" : "error", "messgae": "No Queries found"}, status=status.HTTP_204_NO_CONTENT)
            
            try:
                student_data = StudentData.objects.get(id=id)
                decrypted_config = decrypt_data(student_data.Student_Config)

                conn_params = {
                    'host': decrypted_config['host'],
                    'database': decrypted_config['database'],
                    'user': decrypted_config['username'],
                    'password': decrypted_config['password'],
                    'port': decrypted_config['port'],
                }

                connection_pool = pooling.MySQLConnectionPool(
                    pool_name="student_pool_" + str(id),
                    pool_size=32,
                    **conn_params
                )

                results = []
                try:
                    connection = connection_pool.get_connection()
                    if connection.is_connected():
                        cursor = connection.cursor(dictionary=True)
                        for query in queries:
                            query_result = {"query": query}
                            try:
                                cursor.execute(query)
                                if cursor.description:
                                    rows = cursor.fetchall()
                                    columns = cursor.column_names
                                    query_result.update({
                                        "status": "success",
                                        "message": f"Selected data from table: {self.extract_table_name(query)}",
                                        "result": rows
                                    })
                                    print(rows == [])
                                    logger.info(f"Columns: {columns}, Rows: {rows}")
                                else:
                                    affected_rows = cursor.rowcount
                                    query_result.update({
                                        "status": "success",
                                        "message": f"Query executed successfully, affected rows: {affected_rows}"
                                    })

                                if query.strip().lower().startswith(('insert', 'update', 'delete')):
                                    connection.commit()

                            except Error as e:
                                logger.error(f"Error executing query: {str(e)}")
                                query_result.update({"status": "error", "error": str(e)})
                            results.append(query_result)
                        cursor.close()
                except Error as e:
                    logger.error(f"Database connection error: {str(e)}")
                    return Response({"status": "error", "message": f"Database connection error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                finally:
                    if connection.is_connected():
                        connection.close()

                return Response(results, status=status.HTTP_200_OK)

            except StudentData.DoesNotExist:
                return Response({"status": "error", "message": "Student configuration not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Exception occurred: {str(e)}")
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def extract_table_name(self, query):
        match = re.search(r'select\s+.*?\s+from\s+([a-zA-Z0-9_]+)', query, re.IGNORECASE)
        return match.group(1) if match else 'Unknown Table'

@method_decorator(token_required, name='dispatch')
class SQLQueryExecutionTestCases(APIView):

    def post(self, request, id, *args, **kwargs):
        try:
            data = json.loads(request.body)
            queries = data.get('Code', [])
            test_cases = data.get('TestCases', [])

            # Validate the input data
            if not isinstance(queries, list) or not queries:
                return Response({"error": "Queries parameter missing or not a valid list"}, status=status.HTTP_400_BAD_REQUEST)

            if not isinstance(test_cases, list):
                return Response({"error": "Test cases parameter missing or not a list"}, status=status.HTTP_400_BAD_REQUEST)

            if not all(isinstance(test_case, dict) and 'inputs' in test_case and 'expected' in test_case for test_case in test_cases):
                return Response({"error": "Each test case must be a dictionary with 'inputs' and 'expected' keys"}, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve student configuration
            try:
                student_data = StudentData.objects.get(id=id)
                decrypted_config = decrypt_data(student_data.Student_Config)
                conn_params = {
                    'host': decrypted_config['host'],
                    'database': decrypted_config['database'],
                    'user': decrypted_config['username'],
                    'password': decrypted_config['password'],
                    'port': decrypted_config['port'],
                }

                # Setup connection pool
                connection_pool = pooling.MySQLConnectionPool(
                    pool_name="student_pool_" + str(id),
                    pool_size=32,
                    **conn_params
                )

                results = []
                query = queries[0]

                try:
                    connection = connection_pool.get_connection()
                    if connection.is_connected():
                        cursor = connection.cursor(dictionary=True)

                        for test_case in test_cases:
                            input_params = test_case.get('inputs', [])
                            expected_output = test_case.get('expected')

                            query_result = {"test_case": test_case}

                            try:
                                start_time = time.time()

                                cursor.execute(query, tuple(input_params))
                                if cursor.description:
                                    rows = cursor.fetchall()
                                    actual_output = format_row([convert_row_decimals(row) for row in rows])
                                    
                                    end_time = time.time()
                                    execution_time = end_time - start_time
                                    
                                    passed = actual_output == expected_output
                                    query_result.update({
                                        "status": "success",
                                        "inputs" : test_case['inputs'],
                                        "output": actual_output,
                                        "expected": expected_output,
                                        "passed": passed,
                                        'execution_time': f'{execution_time:.2f} seconds'
                                    })
                                    logger.info(f"Rows: {rows}")
                                else:
                                    affected_rows = cursor.rowcount
                                    query_result.update({
                                        "status": "success",
                                        "message": f"Query executed successfully, affected rows: {affected_rows}"
                                    })

                                if query.strip().lower().startswith(('insert', 'update', 'delete')):
                                    connection.commit()

                            except Error as e:
                                logger.error(f"Error executing query: {str(e)}")
                                query_result.update({"status": "error", "error": str(e)})

                            results.append(query_result)
                        
                        cursor.close()

                except Error as e:
                    logger.error(f"Database connection error: {str(e)}")
                    return Response({"status": "error", "message": f"Database connection error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                finally:
                    if connection.is_connected():
                        connection.close()

                return Response({
                    'results': results,
                    'all_tests_passed': all(result.get('status') == 'success' and result.get('passed') == True for result in results)
                }, status=status.HTTP_200_OK)

            except StudentData.DoesNotExist:
                return Response({"error": "Student configuration not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Exception occurred: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def format_row(rows):
    return [", ".join(map(str, row.values())) for row in rows]

def convert_row_decimals(row):
    for key, value in row.items():
        if isinstance(value, Decimal):
            row[key] = int(value)
        elif isinstance(value, datetime.date):
            row[key] = value.isoformat()
    return row


@method_decorator(token_required, name='dispatch')
class Execute_Python_Code(APIView):
    
    def post(self, request):
        try:
            data = request.data
            code = data.get('Code')
            input_data = data.get('Input', '')

            if not code:
                return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

            requires_input = 'input()' in code
            
            if requires_input and not input_data:
                return Response({'error': 'Input data is required but not provided'}, status=status.HTTP_400_BAD_REQUEST) 
            
            with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as temp_file:
                temp_file.write(code.encode('utf-8'))
                temp_file_path = temp_file.name

            try:
                
                start_time = time.time()

                result = subprocess.run(
                    [sys.executable, temp_file_path],
                    input=input_data if requires_input else None,
                    text=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=10 
                )

                end_time = time.time()
                execution_time = end_time - start_time

                if result.returncode != 0:
                    return Response({'error': result.stderr.strip()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return Response({
                    'output': result.stdout.strip(),
                    'stderr': result.stderr.strip(),
                    'execution_time': f'{execution_time:.2f} seconds'
                })

            except subprocess.TimeoutExpired:
                return Response({'error': 'Execution time limit exceeded'}, status=status.HTTP_408_REQUEST_TIMEOUT)

            finally:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(token_required, name='dispatch')
class Execute_Java_Code(APIView):
    #working
    def post(self, request):
        try:
            data = request.data
            code = data.get('Code')
            input_data = data.get('Input', '')

            if not code:
                return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

            requires_input = 'Scanner' in code or 'BufferedReader' in code
            
            if requires_input and not input_data:
                return Response({'error': 'Input data is required but not provided'}, status=status.HTTP_400_BAD_REQUEST)

            class_name_match = re.search(r'public\s+class\s+(\w+)', code)
            if class_name_match:
                class_name = class_name_match.group(1)
            else:
                return Response({'error': 'No public class name found in Java code'}, status=status.HTTP_400_BAD_REQUEST)

            with tempfile.TemporaryDirectory() as temp_dir:
                source_file = os.path.join(temp_dir, f'{class_name}.java')

                with open(source_file, 'w') as file:
                    file.write(code)

                compile_command = ['javac', source_file]
                try:
                    compile_process = subprocess.run(
                        compile_command,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True,
                        timeout=10
                    )

                    if compile_process.returncode != 0:
                        return Response({'error': compile_process.stderr.strip()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                except subprocess.TimeoutExpired:
                    return Response({'error': 'Compilation time limit exceeded'}, status=status.HTTP_408_REQUEST_TIMEOUT)

                run_command = ['java', '-cp', temp_dir, class_name]
                try:
                    start_time = time.time()
                    run_process = subprocess.Popen(
                        run_command,
                        stdin=subprocess.PIPE if requires_input else None,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True
                    )

                    stdout, stderr = run_process.communicate(input=input_data if requires_input else None, timeout=10)
                    
                    end_time = time.time()
                    execution_time = end_time - start_time
                    
                    if run_process.returncode != 0:
                        return Response({'error': stderr.strip()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                    return Response({'output': stdout.strip(), 'stderr': stderr.strip(),'execution_time': f'\n{execution_time:.2f} seconds'})

                except subprocess.TimeoutExpired:
                    run_process.terminate()
                    return Response({'error': 'Execution time limit exceeded'}, status=status.HTTP_408_REQUEST_TIMEOUT)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)      

@method_decorator(token_required, name='dispatch')
class Execute_C_Code(APIView):
    #working
    def post(self, request):
        try:
            data = request.data
            code = data.get('Code')
            input_data = data.get('Input', '')

            if not code:
                return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

            requires_input = '#include <stdio.h>' in code
            
            if requires_input and not input_data:
                return Response({'error': 'Input data is required but not provided'}, status=status.HTTP_400_BAD_REQUEST)

            with tempfile.NamedTemporaryFile(suffix=".c", delete=False) as temp_file:
                temp_file.write(code.encode('utf-8'))
                temp_file_path = temp_file.name
    
            executable_path = temp_file_path.replace(".c", ".out")
            try:
                start_time = time.time()
                compile_result = subprocess.run(
                    ["gcc", temp_file_path, "-o", executable_path],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )

                if compile_result.returncode != 0:
                    return Response({'error': compile_result.stderr.strip()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                exec_start_time = time.time()
                result = subprocess.run(
                    [executable_path],
                    input=input_data if requires_input else None,
                    text=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=10
                )
                exec_end_time = time.time()
                execution_time = exec_end_time - exec_start_time

                if result.returncode != 0:
                    return Response({'error': result.stderr.strip()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return Response({
                    'output': result.stdout.strip(),
                    'stderr': result.stderr.strip(),
                    'execution_time': f'{execution_time:.2f} seconds'
                })

            except subprocess.TimeoutExpired:
                return Response({'error': 'Execution time limit exceeded'}, status=status.HTTP_408_REQUEST_TIMEOUT)

            finally:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                if os.path.exists(executable_path):
                    os.remove(executable_path)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(token_required, name='dispatch')
class Execute_Cpp_Code(APIView):
    #working
    def post(self, request):
        try:
            data = request.data
            code = data.get('Code')
            input_data = data.get('Input', '')

            if not code:
                return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

            requires_input = '#include <iostream>' in code
            
            if requires_input and not input_data:
                return Response({'error': 'Input data is required but not provided'}, status=status.HTTP_400_BAD_REQUEST)

            # Write the C++ code to a temporary file
            with tempfile.NamedTemporaryFile(suffix=".cpp", delete=False) as temp_file:
                temp_file.write(code.encode('utf-8'))
                temp_file_path = temp_file.name
            
            # Compile the C++ code
            executable_path = temp_file_path.replace(".cpp", ".out")
            try:
                start_time = time.time()
                compile_result = subprocess.run(
                    ["g++", temp_file_path, "-o", executable_path],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )

                if compile_result.returncode != 0:
                    return Response({'error': compile_result.stderr.strip()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # Execute the compiled code
                exec_start_time = time.time()
                result = subprocess.run(
                    [executable_path],
                    input=input_data if requires_input else None,
                    text=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=10
                )
                exec_end_time = time.time()
                execution_time = exec_end_time - exec_start_time

                if result.returncode != 0:
                    return Response({'error': result.stderr.strip()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return Response({
                    'output': result.stdout.strip(),
                    'stderr': result.stderr.strip(),
                    'execution_time': f'{execution_time:.2f} seconds'
                })

            except subprocess.TimeoutExpired:
                return Response({'error': 'Execution time limit exceeded'}, status=status.HTTP_408_REQUEST_TIMEOUT)

            finally:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                if os.path.exists(executable_path):
                    os.remove(executable_path)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(token_required, name='dispatch')
class Execute_Js_Code(APIView):
    def post(self, request):
        try:
            data = request.data
            code = data.get('Code')
            input_data = data.get('Input', '')

            if not code:
                return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

            requires_input = bool(re.search(r'(prompt\s*\(|readline\s*\()', code))

            if requires_input and not input_data:
                return Response({'error': 'Input data is required but not provided'}, status=status.HTTP_400_BAD_REQUEST)

            with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as temp_file:
                temp_file.write(code.encode('utf-8'))
                temp_file_path = temp_file.name
            
            try:
                start_time = time.time()

                result = subprocess.run(
                    ["node", temp_file_path],
                    input=input_data,
                    text=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=10
                )

                end_time = time.time()
                execution_time = end_time - start_time

                if result.returncode != 0:
                    return Response({'error': result.stderr.strip()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return Response({
                    'output': result.stdout.strip(),
                    'stderr': result.stderr.strip(),
                    'execution_time': f'{execution_time:.2f} seconds'
                })

            except subprocess.TimeoutExpired:
                return Response({'error': 'Execution time limit exceeded'}, status=status.HTTP_408_REQUEST_TIMEOUT)

            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#Test Cases

@method_decorator(token_required, name='dispatch')
class Execute_Python_Test_cases(APIView):

    def post(self, request):
        try:
            data = request.data
            code = data.get('Code', '').strip()
            test_cases = data.get('TestCases', [])

            if not isinstance(code, str) or not code:
                return Response({'error': 'Code must be a non-empty string'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not isinstance(test_cases, list) or len(test_cases) > 10:
                return Response({'error': 'Invalid test cases provided. Must be a list with up to 10 test cases.'}, status=status.HTTP_400_BAD_REQUEST)
            
            if any(not isinstance(test_case, dict) or 'inputs' not in test_case or 'expected' not in test_case for test_case in test_cases):
                return Response({'error': 'Each test case must be a dictionary with "inputs" and "expected" keys.'}, status=status.HTTP_400_BAD_REQUEST)

            requires_input = 'input()' in code
            if not requires_input:
                 return Response({'error' : 'Input field is required'},status=status.HTTP_406_NOT_ACCEPTABLE)

            # Write the code to a temporary file
            with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode='w', encoding='utf-8') as temp_file:
                temp_file.write(code)
                temp_file_path = temp_file.name

            results = []
            all_tests_passed = True

            for test_case in test_cases:
                input_data = '\n'.join(test_case.get('inputs', []))  # Convert list to string
                expected_output = test_case.get('expected', [])

                # Normalize expected output
                if isinstance(expected_output, str):
                    expected_output = [expected_output.strip()]
                else:
                    expected_output = [str(e).strip() for e in expected_output]

                try:
                    start_time = time.time()

                    result = subprocess.run(
                        [sys.executable, temp_file_path],
                        input=input_data,
                        text=True,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        timeout=10
                    )
                    
                    end_time = time.time()
                    execution_time = end_time - start_time

                    actual_output = result.stdout.strip().split('\n')
                    error_output = result.stderr.strip()

                    # Normalize actual output
                    actual_output = [str(a).strip() for a in actual_output]

                    # Compare outputs
                    test_status = 'pass' if actual_output == expected_output else 'fail'
                    if test_status == 'fail':
                        all_tests_passed = False

                    results.append({
                        'inputs': [input_data],
                        'expected': expected_output,
                        'output': actual_output,
                        'status': test_status,
                        'execution_time': f'{execution_time:.2f} seconds'
                    })

                except subprocess.TimeoutExpired:
                    all_tests_passed = False
                    results.append({
                        'inputs': [input_data],
                        'expected': expected_output,
                        'output': 'Execution time limit exceeded',
                        'status': 'fail',
                        'execution_time': None
                    })

            # Clean up the temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

            return Response({
                'results': results,
                'all_tests_passed': all_tests_passed
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(token_required, name='dispatch')
class Execute_Js_Test_cases(APIView):

    def post(self, request):
        try:
            data = request.data
            code = data.get('Code', '').strip()
            test_cases = data.get('TestCases', [])

            if not isinstance(code, str) or not code:
                return Response({'error': 'Code must be a non-empty string'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not isinstance(test_cases, list) or len(test_cases) > 10:
                return Response({'error': 'Invalid test cases provided. Must be a list with up to 10 test cases.'}, status=status.HTTP_400_BAD_REQUEST)
            
            if any(not isinstance(test_case, dict) or 'inputs' not in test_case or 'expected' not in test_case for test_case in test_cases):
                return Response({'error': 'Each test case must be a dictionary with "inputs" and "expected" keys.'}, status=status.HTTP_400_BAD_REQUEST)

            requires_input = bool(re.search(r'(prompt\s*\(|readline\s*\()', code))
            if not requires_input:
                 return Response({'error' : 'Input field is required'},status=status.HTTP_406_NOT_ACCEPTABLE)

            with tempfile.NamedTemporaryFile(suffix=".js", delete=False, mode='w', encoding='utf-8') as temp_file:
                temp_file.write(code)
                temp_file_path = temp_file.name

            results = []
            all_tests_passed = True

            for test_case in test_cases:
                input_data = '\n'.join(test_case.get('inputs', []))
                expected_output = test_case.get('expected', [])

                # Normalize expected output
                if isinstance(expected_output, str):
                    expected_output = [expected_output.strip()]
                else:
                    expected_output = [str(e).strip() for e in expected_output]

                try:
                    start_time = time.time()

                    result = subprocess.run(
                        ["node", temp_file_path],
                        input=input_data,
                        text=True,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        timeout=10 
                    )

                    end_time = time.time()
                    execution_time = end_time - start_time

                    actual_output = result.stdout.strip().split('\n')
                    error_output = result.stderr.strip()

                    # Normalize actual output
                    actual_output = [str(a).strip() for a in actual_output]

                    # Compare outputs
                    test_status = 'pass' if actual_output == expected_output else 'fail'
                    if test_status == 'fail':
                        all_tests_passed = False

                    results.append({
                        'inputs': [input_data],
                        'expected': expected_output,
                        'output': actual_output,
                        'status': test_status,
                        'execution_time': f'{execution_time:.2f} seconds'
                    })

                except subprocess.TimeoutExpired:
                    all_tests_passed = False
                    results.append({
                        'inputs': [input_data],
                        'expected': expected_output,
                        'output': 'Execution time limit exceeded',
                        'status': 'fail',
                        'execution_time': None
                    })

            # Clean up the temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

            return Response({
                'results': results,
                'all_tests_passed': all_tests_passed
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(token_required, name='dispatch')
class Execute_Java_Test_Cases(APIView):

    def post(self, request):
        try:
            data = request.data
            code = str(data.get('Code', '')).strip()
            test_cases = data.get('TestCases', [])

            if not isinstance(code, str) or not code:
                return Response({'error': 'Code must be a non-empty string'}, status=status.HTTP_400_BAD_REQUEST)

            if not isinstance(test_cases, list) or len(test_cases) > 10:
                return Response({'error': 'Invalid test cases provided. Must be a list with up to 10 test cases.'}, status=status.HTTP_400_BAD_REQUEST)

            if any(not isinstance(test_case, dict) or 'inputs' not in test_case or 'expected' not in test_case for test_case in test_cases):
                return Response({'error': 'Each test case must be a dictionary with "inputs" and "expected" keys.'}, status=status.HTTP_400_BAD_REQUEST)

            # Extract class name from code
            class_name = self.extract_class_name(code)
            if not class_name:
                return Response({'error': 'No class found in the Java code'}, status=status.HTTP_400_BAD_REQUEST)

            # Write code to a temporary file
            java_file_name = f"{class_name}.java"
            with tempfile.NamedTemporaryFile(suffix=".java", delete=False, mode='w', encoding='utf-8') as temp_file:
                temp_file.write(code)
                temp_file_path = temp_file.name

            # Rename the file to match the class name
            renamed_file_path = os.path.join(os.path.dirname(temp_file_path), java_file_name)
            os.rename(temp_file_path, renamed_file_path)

            results = []
            all_tests_passed = True

            try:
                # Compile the Java code
                compile_process = subprocess.run(
                    ["javac", renamed_file_path],
                    text=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )

                if compile_process.returncode != 0:
                    return Response({
                        'error': 'Java compilation failed',
                        'stderr': compile_process.stderr.strip()
                    }, status=status.HTTP_400_BAD_REQUEST)

                for i, test_case in enumerate(test_cases):
                    input_data = test_case.get('inputs', [])
                    expected_output = test_case.get('expected', [])

                    input_str = '\n'.join(input_data)
                    expected_str = '\n'.join(expected_output)

                    try:
                        start_time = time.time()

                        result = subprocess.run(
                            ["java", "-cp", os.path.dirname(renamed_file_path), class_name],
                            input=input_str,
                            text=True,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            timeout=10
                        )

                        end_time = time.time()
                        execution_time = end_time - start_time

                        output = result.stdout.strip().split('\n')
                        stderr = result.stderr.strip()

                        if isinstance(expected_output, str):
                            expected_output = [expected_output.strip()]
                        else:
                            expected_output = [str(e).strip() for e in expected_output]

                        actual_output = [str(a).strip() for a in output]

                        test_status = 'pass' if actual_output == expected_output else 'fail'
                        if test_status == 'fail':
                            all_tests_passed = False

                        results.append({
                            'inputs': input_data,
                            'expected': expected_output,
                            'output': actual_output,
                            'status': test_status,
                            'execution_time': f'{execution_time:.2f} seconds'
                        })

                    except subprocess.TimeoutExpired:
                        all_tests_passed = False
                        results.append({
                            'inputs': input_data,
                            'expected': expected_output,
                            'output': 'Execution time limit exceeded',
                            'status': 'fail',
                            'execution_time': None
                        })

            finally:
                # Clean up temporary files
                for file in os.listdir(os.path.dirname(renamed_file_path)):
                    if file.endswith(".class"):
                        os.remove(os.path.join(os.path.dirname(renamed_file_path), file))
                if os.path.exists(renamed_file_path):
                    os.remove(renamed_file_path)

            return Response({
                'results': results,
                'all_tests_passed': all_tests_passed
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def extract_class_name(self, code):
        """
        Extracts the class name from the provided Java code.
        Assumes the class name is in a format like `public class ClassName { ... }`
        """
        match = re.search(r'public\s+class\s+(\w+)', code)
        if match:
            return match.group(1)
        return None


@method_decorator(token_required, name='dispatch')
class Execute_C_Test_Cases(APIView):

    def post(self, request):
        try:
            data = request.data
            code = str(data.get('Code', '')).strip()
            test_cases = data.get('TestCases', [])

            if not isinstance(code, str) or not code:
                return Response({'error': 'Code must be a non-empty string'}, status=status.HTTP_400_BAD_REQUEST)

            if not isinstance(test_cases, list) or len(test_cases) > 10:
                return Response({'error': 'Invalid test cases provided. Must be a list with up to 10 test cases.'}, status=status.HTTP_400_BAD_REQUEST)

            if any(not isinstance(test_case, dict) or 'inputs' not in test_case or 'expected' not in test_case for test_case in test_cases):
                return Response({'error': 'Each test case must be a dictionary with "inputs" and "expected" keys.'}, status=status.HTTP_400_BAD_REQUEST)

            # Write the C code to a temporary file
            c_file_name = "temp_code.c"
            with tempfile.NamedTemporaryFile(suffix=".c", delete=False, mode='w', encoding='utf-8') as temp_file:
                temp_file.write(code)
                temp_file_path = temp_file.name

            # Compile the C code
            executable_file = os.path.splitext(temp_file_path)[0]
            compile_process = subprocess.run(
                ["gcc", temp_file_path, "-o", executable_file],
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

            if compile_process.returncode != 0:
                return Response({
                    'error': 'C compilation failed',
                    'stderr': compile_process.stderr.strip()
                }, status=status.HTTP_400_BAD_REQUEST)

            results = []
            all_tests_passed = True

            try:
                # Run each test case
                for i, test_case in enumerate(test_cases):
                    input_data = '\n'.join(test_case.get('inputs', []))
                    expected_output = '\n'.join(test_case.get('expected', []))

                    try:
                        start_time = time.time()

                        result = subprocess.run(
                            [executable_file],
                            input=input_data,
                            text=True,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            timeout=10
                        )

                        end_time = time.time()
                        execution_time = end_time - start_time

                        output = result.stdout.strip().split('\n')
                        stderr = result.stderr.strip()

                        # Normalize expected output
                        if isinstance(expected_output, str):
                            expected_output = [expected_output.strip()]
                        else:
                            expected_output = [str(e).strip() for e in expected_output]

                        # Normalize actual output
                        actual_output = [str(a).strip() for a in output]

                        # Compare outputs
                        test_status = 'pass' if actual_output == expected_output else 'fail'
                        if test_status == 'fail':
                            all_tests_passed = False

                        results.append({
                            'inputs': input_data.split('\n'),
                            'expected': expected_output,
                            'output': actual_output,
                            'status': test_status,
                            'execution_time': f'{execution_time:.2f} seconds'
                        })

                    except subprocess.TimeoutExpired:
                        all_tests_passed = False
                        results.append({
                            'inputs': input_data.split('\n'),
                            'expected': expected_output,
                            'output': 'Execution time limit exceeded',
                            'status': 'fail',
                            'execution_time': None
                        })

            finally:
                # Clean up temporary files
                if os.path.exists(executable_file):
                    os.remove(executable_file)
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

            return Response({
                'results': results,
                'all_tests_passed': all_tests_passed
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(token_required, name='dispatch')
class Execute_CPP_Test_Cases(APIView):

    def post(self, request):
        try:
            data = request.data
            code = str(data.get('Code', '')).strip()
            test_cases = data.get('TestCases', [])

            if not isinstance(code, str) or not code:
                return Response({'error': 'Code must be a non-empty string'}, status=status.HTTP_400_BAD_REQUEST)

            if not isinstance(test_cases, list) or len(test_cases) > 10:
                return Response({'error': 'Invalid test cases provided. Must be a list with up to 10 test cases.'}, status=status.HTTP_400_BAD_REQUEST)

            if any(not isinstance(test_case, dict) or 'inputs' not in test_case or 'expected' not in test_case for test_case in test_cases):
                return Response({'error': 'Each test case must be a dictionary with "inputs" and "expected" keys.'}, status=status.HTTP_400_BAD_REQUEST)

            # Write the C++ code to a temporary file
            cpp_file_name = "temp_code.cpp"
            with tempfile.NamedTemporaryFile(suffix=".cpp", delete=False, mode='w', encoding='utf-8') as temp_file:
                temp_file.write(code)
                temp_file_path = temp_file.name

            # Compile the C++ code
            executable_file = os.path.splitext(temp_file_path)[0]
            compile_process = subprocess.run(
                ["g++", temp_file_path, "-o", executable_file],
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

            if compile_process.returncode != 0:
                return Response({
                    'error': 'C++ compilation failed',
                    'stderr': compile_process.stderr.strip()
                }, status=status.HTTP_400_BAD_REQUEST)

            results = []
            all_tests_passed = True

            try:
                # Run each test case
                for i, test_case in enumerate(test_cases):
                    input_data = '\n'.join(test_case.get('inputs', []))
                    expected_output = '\n'.join(test_case.get('expected', []))

                    try:
                        start_time = time.time()

                        result = subprocess.run(
                            [executable_file],
                            input=input_data,
                            text=True,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            timeout=10
                        )

                        end_time = time.time()
                        execution_time = end_time - start_time

                        output = result.stdout.strip().split('\n')
                        stderr = result.stderr.strip()

                        # Normalize expected output
                        if isinstance(expected_output, str):
                            expected_output = [expected_output.strip()]
                        else:
                            expected_output = [str(e).strip() for e in expected_output]

                        # Normalize actual output
                        actual_output = [str(a).strip() for a in output]

                        # Compare outputs
                        test_status = 'pass' if actual_output == expected_output else 'fail'
                        if test_status == 'fail':
                            all_tests_passed = False

                        results.append({
                            'inputs': input_data.split('\n'),
                            'expected': expected_output,
                            'output': actual_output,
                            'status': test_status,
                            'execution_time': f'{execution_time:.2f} seconds'
                        })

                    except subprocess.TimeoutExpired:
                        all_tests_passed = False
                        results.append({
                            'inputs': input_data.split('\n'),
                            'expected': expected_output,
                            'output': 'Execution time limit exceeded',
                            'status': 'fail',
                            'execution_time': None
                        })

            finally:
                # Clean up temporary files
                if os.path.exists(executable_file):
                    os.remove(executable_file)
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

            return Response({
                'results': results,
                'all_tests_passed': all_tests_passed
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



from rest_framework.views import APIView
from rest_framework.response import Response

class CheckJavaPath(APIView):
    def get(self, request):
        import subprocess
        try:
            path = subprocess.check_output(['which', 'javac']).decode('utf-8').strip()
            return Response({'javac_path': path}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)