import paramiko
import os

# Define your server and SSH credentials
# server_ip = "20.74.202.251"
server_ip = "51.75.73.90"
server_port = 22
# username = "swissdigital"
username = "ubuntu"
# password = "Jg@$svf(0bO1ey02"
password = "XkwzM7dJsvTM"

# Define paths for the source and destination folders
local_source = "/Users/nadersayed/Downloads/route-survey.survys.com"
remote_dest_folder = "/home/swissdigital/SSLs/route-survey.survys.com"

# Define the files and folders to exclude during operations
# exclude_files = ["web.config"]
exclude_folders = ["media", "Uploads"]

def scp_copy(local_path, remote_path, hostname, username, password):
    # Create a transport object
    transport = paramiko.Transport((hostname, 22))
    
    # Connect to the server
    transport.connect(username=username, password=password)
    
    # Create an SCP client
    scp = paramiko.SFTPClient.from_transport(transport)

    print("Connected successfully ... ")
    
    try:
        # Check if local_path is a file or directory
        if os.path.isfile(local_path):
            # Copy file
            # print("Attempting to copy file: " + str(local_path))
            scp.put(local_path, remote_path)
            # print(f"File '{local_path}' copied to '{remote_path}'")
        elif os.path.isdir(local_path):
            # print("Attempting to copy folder: " + str(local_path))
            # Copy directory
            for root, dirs, files in os.walk(local_path):
                for file in files:
                    try:
                        print("Copying file: " + str(file))
                        local_file_path = os.path.join(root, file)
                        remote_file_path = os.path.join(remote_path, os.path.relpath(local_file_path, local_path)).replace("\\", "/")
                        scp.put(local_file_path, remote_file_path)
                        # print(f"File '{local_file_path}' copied to '{remote_file_path}'")
                        print("Copied file: " + str(file))
                    except Exception as ex:
                        print(str(ex))
                for dir in dirs:
                    try:
                        if dir in exclude_folders:
                            print("Skipping " + str(dir) + " Folder ... ")
                            continue
                        remote_dir_path = os.path.join(remote_path, os.path.relpath(os.path.join(root, dir), local_path)).replace("\\", "/")
                        scp.mkdir(remote_dir_path)
                        # print(f"Directory '{remote_dir_path}' created ")
                    except Exception as ex:
                        print(str(ex))
        else:
            print("Error: Invalid path")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Close the connection
        scp.close()
        transport.close()

scp_copy(local_source, remote_dest_folder, server_ip, username, password)